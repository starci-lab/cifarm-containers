import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import {
    BeeHouseCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemTypeId,
    PlacedItemType,
    PlantCurrentState,
    PlantType,
    BuildingKind
} from "@src/databases"
import { Job } from "bullmq"
import { DateUtcService } from "@src/date"
import { SyncService, StaticService, PositionService } from "@src/gameplay"
import { Connection } from "mongoose"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"
import { createObjectId, WithStatus } from "@src/common"
import { BeeHouseJobData } from "@apps/cron-scheduler"
import { SyncPlacedItemsPayload } from "@apps/io"

@Processor(bullData[BullQueueName.BeeHouse].name)
export class BeeHouseWorker extends WorkerHost {
    private readonly logger = new Logger(BeeHouseWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer,
        private readonly syncService: SyncService,
        private readonly dateUtcService: DateUtcService,
        private readonly staticService: StaticService,
        private readonly positionService: PositionService
    ) {
        super()
    }

    public override async process(job: Job<BeeHouseJobData>): Promise<void> {
        try {
            this.logger.verbose(`Processing job: ${job.id}`)
            const { time, skip, take, utcTime } = job.data

            const building = this.staticService.buildings.find(
                (building) => building.kind === BuildingKind.BeeHouse
            )
            if (!building) {
                throw new Error("Bee house not found")
            }
            const { beeHouseYieldTime, upgrades } = building
            if (!upgrades) {
                throw new Error("Bee house upgrades not found")
            }
            const placedItems = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({
                    placedItemType: createObjectId(PlacedItemTypeId.BeeHouse),
                    buildingInfo: {
                        $ne: null
                    },
                    beeHouseInfo: {
                        $ne: null
                    },
                    // Compare this snippet from apps/cron-scheduler/src/animal/animal.service.ts:
                    "beeHouseInfo.currentState": {
                        $nin: [BeeHouseCurrentState.Yield]
                    },
                    createdAt: {
                        $lte: this.dateUtcService.getDayjs(utcTime).toDate()
                    }
                })
                .skip(skip)
                .limit(take)
                .sort({ createdAt: "desc" })
            const promises: Array<Promise<void>> = []
            const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
            for (const placedItem of placedItems) {
                const promise = async () => {
                    try {
                        const upgrade = upgrades.find(
                            (upgrade) =>
                                upgrade.upgradeLevel === placedItem.buildingInfo.currentUpgrade
                        )
                        if (!upgrade) {
                            throw new Error("Bee house upgrade not found")
                        }
                        const { honeyMultiplier } = upgrade

                        const updatePlacedItem = async (): Promise<boolean> => {
                            placedItem.beeHouseInfo.currentYieldTime += time
                            if (placedItem.beeHouseInfo.currentYieldTime >= beeHouseYieldTime) {
                                const placedItemType = this.staticService.placedItemTypes.find(
                                    (placedItemType) =>
                                        placedItemType.displayId === PlacedItemTypeId.BeeHouse
                                )
                                if (!placedItemType) {
                                    throw new Error("Bee house type not found")
                                }
                                let totalHoneyYieldCoefficient = building.baseHoneyYieldCoefficient
                                let totalHoneyQualityChancePlus = 0
                                // check how many flower tile are adjacent to the bee house
                                const adjacentPositions = this.positionService.getAdjacentPositions(
                                    {
                                        position: {
                                            x: placedItem.x,
                                            y: placedItem.y
                                        },
                                        placedItemType
                                    }
                                )
                                // check if the adjacent positions are flower tile
                                const placedItemTypeTiles =
                                    this.staticService.placedItemTypes.filter(
                                        (placedItemType) =>
                                            placedItemType.type === PlacedItemType.Tile
                                    )
                                const placedItemTiles = await this.connection
                                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                                    .find({
                                        placedItemType: {
                                            $in: placedItemTypeTiles.map(
                                                (placedItemType) => placedItemType._id
                                            )
                                        },
                                        plantInfo: {
                                            $ne: null
                                        },
                                        "plantInfo.currentState": {
                                            $in: [PlantCurrentState.FullyMatured]
                                        },
                                        "plantInfo.plantType": {
                                            $in: [PlantType.Flower]
                                        },
                                        $or: adjacentPositions.map(position => ({
                                            x: position.x,
                                            y: position.y
                                        }))
                                    })
                                for (const placedItemTile of placedItemTiles) {
                                    const placedItemTileType = this.staticService.placedItemTypes.find(
                                        (placedItemType) => placedItemType.id === placedItemTile.placedItemType.toString()
                                    )
                                    if (!placedItemTileType) {
                                        throw new Error("Placed item tile type not found")
                                    }
                                    const flower = this.staticService.flowers.find(
                                        (flower) => placedItemTile.plantInfo.plantType === PlantType.Flower
                                        && flower.id === placedItemTile.plantInfo.flower.toString()
                                    )

                                    if (!flower) {
                                        throw new Error("Flower not found")
                                    }
                                    totalHoneyYieldCoefficient += flower.honeyYieldCoefficient
                                    totalHoneyQualityChancePlus += flower.honeyQualityChancePlus
                                }

                                placedItem.beeHouseInfo.currentState = BeeHouseCurrentState.Yield
                                const desiredHarvestQuantity = Math.floor(
                                    totalHoneyYieldCoefficient * honeyMultiplier
                                )
                                placedItem.beeHouseInfo.harvestQuantityRemaining = desiredHarvestQuantity
                                placedItem.beeHouseInfo.harvestQuantityDesired = desiredHarvestQuantity

                                if (Math.random() < totalHoneyQualityChancePlus) {
                                    placedItem.beeHouseInfo.isQuality = true
                                }
                                placedItem.beeHouseInfo.currentYieldTime = 0
                                return true
                            }
                            return false
                        }
                        // update the placed item
                        const placedItemSnapshot = placedItem.$clone()
                        const synced = await updatePlacedItem()
                        await placedItem.save()
                        if (synced) {
                            const updatedSyncedPlacedItem =
                                this.syncService.getPartialUpdatedSyncedPlacedItem({
                                    placedItemSnapshot,
                                    placedItemUpdated: placedItem
                                })
                            syncedPlacedItems.push(updatedSyncedPlacedItem)
                            const syncedPlacedItemsPayload: SyncPlacedItemsPayload = {
                                data: [updatedSyncedPlacedItem],
                                userId: placedItem.user.toString()
                            }
                            await this.kafkaProducer.send({
                                topic: KafkaTopic.SyncPlacedItems,
                                messages: [
                                    {
                                        value: JSON.stringify(syncedPlacedItemsPayload)
                                    }
                                ]
                            })
                        }
                    } catch (error) {
                        this.logger.error(error)
                    }
                }
                promises.push(promise())
            }
            await Promise.all(promises)
        } catch (error) {
            this.logger.error(error)
        }
    }
}

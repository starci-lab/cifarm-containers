import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    Activities,
    CropCurrentState,
    DefaultInfo,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    PlacedItemSchema,
    SEED_GROWTH_INFO,
    SystemId,
    KeyValueRecord,
    SystemSchema,
    UserSchema,
    CropSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { HarvestCropRequest, HarvestCropResponse } from "./harvest-crop.dto"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class HarvestCropService {
    private readonly logger = new Logger(HarvestCropService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka,
    ) {}

    async harvestCrop(request: HarvestCropRequest): Promise<HarvestCropResponse> {
        this.logger.debug(
            `Harvesting crop for user ${request.userId}, tile ID: ${request.placedItemTileId}`
        )

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            const placedItemTile = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(request.placedItemTileId)
                .populate(SEED_GROWTH_INFO)
                .session(mongoSession)

            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")
            if (!placedItemTile.seedGrowthInfo)
                throw new GrpcFailedPreconditionException("Tile is not planted")
            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.FullyMatured)
                throw new GrpcFailedPreconditionException("Crop is not fully matured")

            const {
                value: {
                    harvestCrop: { energyConsume, experiencesGain }
                }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                .session(mongoSession)

            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findById(request.userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            const energyChanges = this.energyService.substract({
                user,
                quantity: energyConsume
            })
            const experienceChanges = this.levelService.addExperiences({
                user,
                experiences: experiencesGain
            })

            const inventoryType = await this.connection
                .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                .findOne({
                    type: InventoryType.Product,
                    product: placedItemTile.seedGrowthInfo.crop
                })
                .session(mongoSession)

            if (!inventoryType) throw new GrpcNotFoundException("Inventory type not found")

            const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                connection: this.connection,
                inventoryType,
                userId: user.id,
                session: mongoSession
            })

            const {
                value: { storageCapacity }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
            await this.connection
                .model<UserSchema>(UserSchema.name)
                .updateOne({ _id: user.id }, { ...energyChanges, ...experienceChanges })

            const quantity = placedItemTile.seedGrowthInfo.harvestQuantityRemaining
            const { createdInventories, updatedInventories } = this.inventoryService.add({
                inventoryType,
                inventories,
                capacity: storageCapacity,
                quantity,
                userId: user.id,
                occupiedIndexes
            })

            await this.connection
                .model<InventorySchema>(InventorySchema.name)
                .create(createdInventories, { session: mongoSession })
            for (const inventory of updatedInventories) {
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .updateOne(
                        {
                            _id: inventory._id
                        },
                        inventory
                    )
                    .session(mongoSession)
            }

            //Find crop id
            const crop = await this.connection
                .model<CropSchema>(CropSchema.name)
                .findById(placedItemTile.seedGrowthInfo.crop)

            //perennialCount & currentPerennialCount
            if (placedItemTile.seedGrowthInfo.currentPerennialCount < crop.perennialCount) {
                placedItemTile.seedGrowthInfo.currentPerennialCount += 1
                placedItemTile.seedGrowthInfo.currentState = CropCurrentState.Normal
                placedItemTile.seedGrowthInfo.currentStage = crop.nextGrowthStageAfterHarvest
                placedItemTile.seedGrowthInfo.currentStageTimeElapsed = 0
            }else{
                placedItemTile.seedGrowthInfo = null
            }

            await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .updateOne(
                    { _id: placedItemTile._id },
                    {
                        seedGrowthInfo: placedItemTile.seedGrowthInfo
                    }
                )
                .session(mongoSession)


            await mongoSession.commitTransaction()
            
            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: request.userId
            })

            return {
                quantity
            }
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

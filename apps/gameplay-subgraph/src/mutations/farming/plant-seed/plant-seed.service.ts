import { Injectable, Logger } from "@nestjs/common"
import {
    CropCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeId,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { PlantSeedRequest } from "./plant-seed.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class PlantSeedService {
    private readonly logger = new Logger(PlantSeedService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async plantSeed(
        { id: userId }: UserLike,
        { inventorySeedId, placedItemTileId }: PlantSeedRequest
    ): Promise<void> {
        this.logger.debug(`Planting seed for user ${userId}, tile ID: ${placedItemTileId}`)

        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload | undefined

        try {
            await mongoSession.withTransaction(async (session) => {
                const inventoryTypeWateringCan = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.displayId === InventoryTypeId.WateringCan
                )
                if (!inventoryTypeWateringCan) {
                    throw new GraphQLError("Watering can not found from static data", {
                        extensions: {
                            code: "WATERING_CAN_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }

                // check if user own the watering can
                const hasInventoryWateringCan = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .exists({
                        user: userId,
                        inventoryType: inventoryTypeWateringCan.id
                    })
                    .session(session)

                if (!hasInventoryWateringCan) {
                    throw new GraphQLError("User does not have a watering can", {
                        extensions: {
                            code: "WATERING_CAN_NOT_FOUND"
                        }
                    })
                }

                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySeedId)
                    .session(session)

                if (!inventory) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND"
                        }
                    })
                }

                const inventoryTypeSeed = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.id.toString() === inventory.inventoryType.toString()
                )

                // throw the error direct since we know this is an internal server error
                if (!inventoryTypeSeed) {
                    throw new GraphQLError("Inventory type seed not found from static data", {
                        extensions: {
                            code: "INVENTORY_TYPE_SEED_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }

                if (inventoryTypeSeed.type !== InventoryType.Seed) {
                    throw new GraphQLError("Inventory type is not a seed", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_SEED"
                        }
                    })
                }

                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)

                if (!placedItemTile) {
                    throw new GraphQLError("Tile not found", {
                        extensions: {
                            code: "TILE_NOT_FOUND"
                        }
                    })
                }
                if (placedItemTile.user.toString() !== userId) {
                    throw new GraphQLError("Cannot plant seed on another user's tile", {
                        extensions: {
                            code: "UNAUTHORIZED_PLANTING"
                        }
                    })
                }
                if (placedItemTile.seedGrowthInfo) {
                    throw new GraphQLError("Tile is already planted", {
                        extensions: {
                            code: "TILE_ALREADY_PLANTED"
                        }
                    })
                }

                const { energyConsume, experiencesGain } = this.staticService.activities.plantSeed

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }
                
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume
                })
                const experiencesChanges = this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                const crop = this.staticService.crops.find(
                    crop => crop.id.toString() === inventoryTypeSeed.crop.toString()
                )

                if (!crop) {
                    throw new GraphQLError("Crop not found from static data", {
                        extensions: {
                            code: "CROP_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }

                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...energyChanges, ...experiencesChanges })
                    .session(session)

                const { inventories } = await this.inventoryService.getRemoveParams({
                    connection: this.connection,
                    userId: user.id,
                    session,
                    inventoryType: inventoryTypeSeed,
                    kind: inventory.kind
                })

                const { removedInventories, updatedInventories } = this.inventoryService.remove({
                    inventories,
                    quantity: 1
                })

                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne({ _id: inventory._id }, inventory)
                        .session(session)
                }

                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .deleteMany({
                        _id: { $in: removedInventories.map((inventory) => inventory._id) }
                    })
                    .session(session)

                await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .updateOne(
                        { _id: placedItemTile._id },
                        {
                            seedGrowthInfo: {
                                crop: crop.id,
                                harvestQuantityRemaining: crop.maxHarvestQuantity,
                                currentState: CropCurrentState.Normal
                            }
                        }
                    )
                    .session(session)

                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.PlantSeed,
                    success: true,
                    userId
                }
            })

            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId }) }]
                })
            ])
        } catch (error) {
            this.logger.error(error)

            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

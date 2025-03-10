import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    Activities,
    CROP,
    CropCurrentState,
    CropRandomness,
    CropSchema,
    DefaultInfo,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    KeyValueRecord,
    PlacedItemSchema,
    ProductSchema,
    ProductType,
    SystemId,
    SystemSchema,
    UserSchema,
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, ThiefService } from "@src/gameplay"
import { ThiefCropRequest, ThiefCropResponse } from "./thief-crop.dto"
import { Connection } from "mongoose"
import { GrpcInvalidArgumentException } from "nestjs-grpc-exceptions"
import { createObjectId } from "@src/common"
import { ActionName, EmitActionPayload, ThiefCropData } from "@apps/io-gameplay"
import { Producer } from "kafkajs"

@Injectable()
export class ThiefCropService {
    private readonly logger = new Logger(ThiefCropService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly thiefService: ThiefService,
        private readonly inventoryService: InventoryService
    ) {}

    async thiefCrop({ placedItemTileId, userId }: ThiefCropRequest): Promise<ThiefCropResponse> {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload<ThiefCropData> | undefined
        let neighborUserId: string | undefined
        try {
            // Use `withTransaction` to handle the MongoDB session and transaction automatically
            const result = await mongoSession.withTransaction(async (mongoSession) => {
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(mongoSession)

                if (!placedItemTile) {
                    throw new GrpcInvalidArgumentException("Tile not found")
                }

                neighborUserId = placedItemTile.user.toString()
                if (neighborUserId === userId) {
                    throw new GrpcInvalidArgumentException("Cannot thief from your own tile")
                }
                if (!placedItemTile.seedGrowthInfo) {
                    throw new GrpcInvalidArgumentException("Tile is not planted")
                }
                if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.FullyMatured) {
                    throw new GrpcInvalidArgumentException("Crop is not fully matured")
                }

                // Check if the user has already stolen from this tile
                const users = placedItemTile.seedGrowthInfo.thieves
                if (users.map(user => user.toString()).includes(userId)) {
                    actionMessage = {
                        placedItemId: placedItemTileId,
                        action: ActionName.ThiefCrop,
                        success: false,
                        userId,
                        reasonCode: 1,
                    }
                    throw new GrpcInvalidArgumentException("User already thief")
                }

                const { value: { thiefCrop: { energyConsume, experiencesGain } } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                    .session(mongoSession)

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume,
                })

                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume,
                })

                const experienceChanges = this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain,
                })

                // Crop randomness
                const { value: { thief2, thief3 } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<CropRandomness>>(createObjectId(SystemId.CropRandomness))
                    .session(mongoSession)

                const product = await this.connection
                    .model<ProductSchema>(ProductSchema.name)
                    .findOne({
                        type: ProductType.Crop,
                        crop: placedItemTile.seedGrowthInfo.crop,
                    })
                    .populate(CROP)
                    .session(mongoSession)

                const crop = product.crop as CropSchema

                const { value: computedQuantity } = this.thiefService.compute({
                    thief2,
                    thief3,
                })

                const actualQuantity = Math.min(
                    computedQuantity,
                    placedItemTile.seedGrowthInfo.harvestQuantityRemaining - crop.minHarvestQuantity
                )

                if (actualQuantity <= 0) {
                    actionMessage = {
                        placedItemId: placedItemTileId,
                        action: ActionName.ThiefCrop,
                        success: false,
                        userId,
                        reasonCode: 2,
                    }
                    throw new GrpcInvalidArgumentException("Thief quantity is less than minimum harvest quantity")
                }

                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        type: InventoryType.Product,
                        product: product.id,
                    })
                    .session(mongoSession)

                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session: mongoSession,
                })

                const { value: { storageCapacity } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity: actualQuantity,
                    userId: user.id,
                    occupiedIndexes,
                })

                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .create(createdInventories, { session: mongoSession })

                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne({ _id: inventory._id }, inventory)
                        .session(mongoSession)
                }

                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...energyChanges, ...experienceChanges }
                ).session(mongoSession)

                placedItemTile.seedGrowthInfo.harvestQuantityRemaining = placedItemTile.seedGrowthInfo.harvestQuantityRemaining - actualQuantity
                placedItemTile.seedGrowthInfo.thieves.push(user.id)
                await placedItemTile.save({ session: mongoSession })

                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.ThiefCrop,
                    success: true,
                    userId,
                    data: { quantity: actualQuantity, cropId: crop.id },
                }

                // Commit the transaction automatically after all operations are successful
                return { quantity: actualQuantity }
            })

            // Send success action message to Kafka
            Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }],
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId: neighborUserId }) }],
                }),
            ])

            return result
        } catch (error) {
            this.logger.error(error)

            if (actionMessage) {
                // Send failure action message in case of error
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }],
                })
            }

            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}

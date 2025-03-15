import {
    ActionName,
    EmitActionPayload,
    ThiefFruitData,
} from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    Activities,
    FruitCurrentState, FruitRandomness, DefaultInfo, InjectMongoose, InventorySchema,
    InventoryType,
    InventoryTypeSchema, KeyValueRecord, PlacedItemSchema, ProductSchema, ProductType, SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import {
    EnergyService,
    InventoryService,
    LevelService,
    ThiefService,
} from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { GrpcInvalidArgumentException } from "nestjs-grpc-exceptions"
import { ThiefFruitRequest, ThiefFruitResponse } from "./thief-fruit.dto"
import { createObjectId } from "@src/common"

@Injectable()
export class ThiefFruitService {
    private readonly logger = new Logger(ThiefFruitService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly thiefService: ThiefService,
        private readonly inventoryService: InventoryService
    ) {}

    async thiefFruit(
        { placedItemFruitId, userId }: ThiefFruitRequest
    ): Promise<ThiefFruitResponse> {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload<ThiefFruitData> | undefined
        let neighborUserId: string | undefined
        
        try {
            const result = await mongoSession.withTransaction(async (mongoSession) => {
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .session(mongoSession)

                if (!placedItemFruit) {
                    throw new GrpcInvalidArgumentException("Fruit not found")
                }

                neighborUserId = placedItemFruit.user.toString()
                if (neighborUserId === userId) {
                    throw new GrpcInvalidArgumentException("Cannot thief from your own fruit")
                }

                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.FullyMatured) {
                    throw new GrpcInvalidArgumentException("Fruit is not FullyMatured")
                }

                const users = placedItemFruit.fruitInfo.thieves
                if (users.map(user => user.toString()).includes(userId)) {
                    actionMessage = {
                        placedItemId: placedItemFruitId,
                        action: ActionName.ThiefFruit,
                        success: false,
                        userId,
                        reasonCode: 1,
                    }
                    throw new GrpcInvalidArgumentException("User already thief")
                }

                const { value: { thiefFruit: { energyConsume, experiencesGain } } } = await this.connection
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

                const { value: { thief2, thief3 } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<FruitRandomness>>(createObjectId(SystemId.FruitRandomness))
                    .session(mongoSession)

                const { value: computedQuantity } = this.thiefService.compute({
                    thief2, thief3
                })

                const actualQuantity = Math.min(
                    computedQuantity,
                    placedItemFruit.fruitInfo.harvestQuantityRemaining
                )

                if (actualQuantity <= 0) {
                    actionMessage = {
                        placedItemId: placedItemFruitId,
                        action: ActionName.ThiefFruit,
                        success: false,
                        userId,
                        reasonCode: 2,
                    }
                    throw new GrpcInvalidArgumentException("Thief quantity is less than minimum yield quantity")
                }

                const product = await this.connection
                    .model<ProductSchema>(ProductSchema.name)
                    .findOne({
                        type: ProductType.Fruit,
                        fruit: placedItemFruit.fruitInfo.fruit,
                        isQuality: placedItemFruit.fruitInfo.isQuality,
                    })
                    .session(mongoSession)

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

                placedItemFruit.fruitInfo.harvestQuantityRemaining -= actualQuantity
                placedItemFruit.fruitInfo.thieves.push(user.id)
                await placedItemFruit.save({ session: mongoSession })

                actionMessage = {
                    placedItemId: placedItemFruitId,
                    action: ActionName.ThiefFruit,
                    success: true,
                    userId,
                    data: { 
                        quantity: actualQuantity,
                        productId: product?.displayId,
                    },
                }

                return { quantity: actualQuantity }
            })

            await Promise.all([
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
            await mongoSession.endSession()
        }
    }
}

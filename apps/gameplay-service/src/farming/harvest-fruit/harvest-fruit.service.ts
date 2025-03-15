import { ActionName, EmitActionPayload, HarvestFruitData } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    Activities,
    DefaultInfo,
    FRUIT_INFO,
    FruitCurrentState,
    FruitSchema,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    KeyValueRecord,
    PlacedItemSchema,
    ProductSchema,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, ProductService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { HarvestFruitRequest, HarvestFruitResponse } from "./harvest-fruit.dto"

@Injectable()
export class HarvestFruitService {
    private readonly logger = new Logger(HarvestFruitService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly productService: ProductService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async harvestFruit({
        placedItemFruitId,
        userId
    }: HarvestFruitRequest): Promise<HarvestFruitResponse> {
        this.logger.debug(
            `Harvesting fruit for user ${userId}, tile ID: ${placedItemFruitId}`
        )

        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload<HarvestFruitData> | undefined

        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // Fetch placed item tile
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .populate(FRUIT_INFO)
                    .session(session)

                if (!placedItemFruit) throw new GrpcNotFoundException("Fruit not found")
                if (!placedItemFruit.fruitInfo)
                    throw new GrpcFailedPreconditionException("Fruit is not planted")
                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.FullyMatured)
                    throw new GrpcFailedPreconditionException("Fruit is not fully matured")

                // Fetch system settings
                const {
                    value: {
                        harvestFruit: { energyConsume, experiencesGain }
                    }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                    .session(session)

                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) throw new GrpcNotFoundException("User not found")

                // Check if the user has sufficient energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                // Deduct energy and add experience
                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume
                })
                const experienceChanges = this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Fetch inventory type for the harvested fruit
                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        type: InventoryType.Product,
                        product: placedItemFruit.fruitInfo.fruit
                    })
                    .session(session)

                if (!inventoryType) throw new GrpcNotFoundException("Inventory type not found")

                // Get parameters for adding inventory
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session
                })

                // Fetch storage capacity setting
                const {
                    value: { storageCapacity }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

                // Update user with energy and experience changes
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...energyChanges, ...experienceChanges })
                    .session(session)

                // Harvest quantity
                const quantity = placedItemFruit.fruitInfo.harvestQuantityRemaining

                // Add the harvested fruit to the inventory
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
                    .create(createdInventories, { session })

                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne(
                            {
                                _id: inventory._id
                            },
                            inventory
                        )
                        .session(session)
                }

                // Fetch fruit details to update perennial count
                const fruit = await this.connection
                    .model<FruitSchema>(FruitSchema.name)
                    .findById(placedItemFruit.fruitInfo.fruit)
                    .session(session)

                if (!fruit) throw new GrpcNotFoundException("Fruit not found")

                const product = await this.connection
                    .model<ProductSchema>(ProductSchema.name)
                    .findOne({
                        isQuality: placedItemFruit.fruitInfo.isQuality,
                        fruit: placedItemFruit.fruitInfo.fruit
                    })
                    .session(session)

                // Handle perennial fruit growth cycle

                const fruitInfoAfterCollectChanges = this.productService.updateFruitInfoAfterHarvest({
                    fruitInfo: placedItemFruit.fruitInfo,
                    fruit,
                })

                // Update the placed item tile with new seed growth information
                await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .updateOne(
                        { _id: placedItemFruit._id },
                        {
                            fruitInfo: {
                                ...placedItemFruit.fruitInfo,
                                ...fruitInfoAfterCollectChanges
                            }
                        }
                    )
                    .session(session)

                // Prepare action message
                actionMessage = {
                    placedItemId: placedItemFruitId,
                    action: ActionName.HarvestFruit,
                    success: true,
                    userId,
                    data: {
                        productId: product.displayId,
                        quantity
                    }
                }

                return { quantity } // Return the quantity of harvested fruits
            })
            
            // Send Kafka messages for success
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

            return result // Return the result from the transaction
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            // withTransaction handles rollback automatically, no need for manual abort
            throw error // Rethrow error to be handled higher up
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}

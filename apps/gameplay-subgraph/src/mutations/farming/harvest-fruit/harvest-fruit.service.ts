import { ActionName, EmitActionPayload, HarvestFruitData } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    FruitCurrentState,
    InjectMongoose,
    InventorySchema,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import {
    EnergyService,
    InventoryService,
    LevelService,
    ProductService,
    StaticService
} from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { HarvestFruitRequest, HarvestFruitResponse } from "./harvest-fruit.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class HarvestFruitService {
    private readonly logger = new Logger(HarvestFruitService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly productService: ProductService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async harvestFruit(
        { id: userId }: UserLike,
        { placedItemFruitId }: HarvestFruitRequest
    ): Promise<HarvestFruitResponse> {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload<HarvestFruitData> | undefined

        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // Fetch placed item tile
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .session(session)

                if (!placedItemFruit) {
                    throw new GraphQLError("Fruit not found", {
                        extensions: {
                            code: "FRUIT_NOT_FOUND"
                        }
                    })
                }
                if (!placedItemFruit.fruitInfo) {
                    throw new GraphQLError("Fruit is not planted", {
                        extensions: {
                            code: "FRUIT_NOT_PLANTED"
                        }
                    })
                }
                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.FullyMatured) {
                    throw new GraphQLError("Fruit is not fully matured", {
                        extensions: {
                            code: "FRUIT_NOT_FULLY_MATURED"
                        }
                    })
                }
                // Fetch system settings
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.harvestFruit
                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user)
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })

                // Check if the user has sufficient energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                // Deduct energy and add experience
                this.energyService.substract({
                    user,
                    quantity: energyConsume
                })
                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                const product = this.staticService.products.find((product) => {
                    return (
                        product.fruit &&
                        product.isQuality !== undefined &&
                        product.fruit.toString() === placedItemFruit.fruitInfo.fruit.toString() &&
                        product.isQuality === placedItemFruit.fruitInfo.isQuality
                    )
                })
                
                if (!product) {
                    throw new GraphQLError("Product not found from static data", {
                        extensions: {
                            code: "PRODUCT_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }

                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.product.toString() === product.id.toString()
                )

                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found from static data", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }

                // Get parameters for adding inventory
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session
                })

                // Fetch storage capacity setting
                const { storageCapacity } = this.staticService.defaultInfo

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
                    await inventory.save({ session })
                }

                const fruit = this.staticService.fruits.find(
                    (fruit) => fruit.id.toString() === placedItemFruit.fruitInfo.fruit.toString()
                )
                if (!fruit) {
                    throw new GraphQLError("Fruit not found from static data", {
                        extensions: {
                            code: "FRUIT_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }
            
                // Handle perennial fruit growth cycle
                this.productService.updatePlacedItemFruitAfterHarvest({
                    placedItemFruit,
                    fruit
                })
                
                // save the related models
                await user.save({ session })
                await placedItemFruit.save({ session })
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

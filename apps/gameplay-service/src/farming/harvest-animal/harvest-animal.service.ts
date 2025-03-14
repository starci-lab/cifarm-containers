import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    Activities,
    ANIMAL_INFO,
    AnimalCurrentState,
    DefaultInfo,
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
import { HarvestAnimalRequest, HarvestAnimalResponse } from "./harvest-animal.dto"

interface HarvestAnimalData {
    productId: string;
    quantity: number;
}

@Injectable()
export class HarvestAnimalService {
    private readonly logger = new Logger(HarvestAnimalService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly productService: ProductService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async harvestAnimal({
        placedItemAnimalId,
        userId
    }: HarvestAnimalRequest): Promise<HarvestAnimalResponse> {
        this.logger.debug(
            `Harvesting animal for user ${userId}, animal ID: ${placedItemAnimalId}`
        )

        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload<HarvestAnimalData> | undefined

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                // Fetch placed item animal with its info
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .populate(ANIMAL_INFO)
                    .session(session)

                if (!placedItemAnimal) {
                    throw new GrpcNotFoundException("Animal not found")
                }

                if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Yield) {
                    throw new GrpcFailedPreconditionException("Animal is not ready to collect product")
                }

                // Fetch system settings
                const {
                    value: {
                        harvestAnimal: { energyConsume, experiencesGain }
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

                // Check if user has sufficient energy
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

                //get product
                const product = await this.connection
                    .model<ProductSchema>(ProductSchema.name)
                    .findOne({
                        isQuality: placedItemAnimal.animalInfo.isQuality,
                        animal: placedItemAnimal.animalInfo.animal
                    })
                    .session(session)

                // Get inventory type for animal product
                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        type: InventoryType.Product,
                        product: createObjectId(product?.displayId)
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

                // Get harvest quantity
                const quantity = placedItemAnimal.animalInfo.harvestQuantityRemaining

                // Add the harvested product to inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity,
                    userId: user.id,
                    occupiedIndexes
                })

                // Create new inventories
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .create(createdInventories, { session })

                // Update existing inventories
                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne(
                            { _id: inventory._id },
                            inventory
                        )
                        .session(session)
                }

                // Update animal info after collect
                const animalInfoAfterCollectChanges = this.productService.updateAnimalInfoAfterCollect({
                    animalInfo: placedItemAnimal.animalInfo
                })

                // Update the animal info
                await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .updateOne(
                        { _id: placedItemAnimal._id },
                        {
                            animalInfo: {
                                ...animalInfoAfterCollectChanges
                            }
                        }
                    )
                    .session(session)

                // Prepare action message
                actionMessage = {
                    placedItemId: placedItemAnimalId,
                    action: ActionName.HarvestAnimal,
                    success: true,
                    userId,
                    data: {
                        productId: product?.displayId,
                        quantity
                    }
                }

                return { quantity }
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

            return result

        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
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

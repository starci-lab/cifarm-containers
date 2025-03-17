import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId } from "@src/common"
import {
    AnimalCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    PlacedItemSchema,
    ProductSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, ProductService, StaticService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { HarvestAnimalRequest } from "./harvest-animal.dto"
import { UserLike } from "@src/jwt" 

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
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        private readonly staticService: StaticService
    ) {}

    async harvestAnimal(
        { id: userId }: UserLike,
        { placedItemAnimalId }: HarvestAnimalRequest
    ): Promise<void> {
        this.logger.debug(
            `Harvesting animal for user ${userId}, animal ID: ${placedItemAnimalId}`
        )

        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload<HarvestAnimalData> | undefined

        try {
            await mongoSession.withTransaction(async (session) => {
                // Fetch placed item animal with its info
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(session)

                if (!placedItemAnimal) {
                    throw new NotFoundException("Animal not found")
                }   

                if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Yield) {
                    throw new BadRequestException("Animal is not ready to collect product")
                }

                // Fetch system settings
                const {
                    energyConsume,
                    experiencesGain
                } = this.staticService.activities.harvestAnimal

                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) throw new NotFoundException("User not found")

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

                if (!inventoryType) throw new NotFoundException("Inventory type not found")

                // Get parameters for adding inventory
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session
                })

                // Fetch storage capacity setting
                const { storageCapacity } = this.staticService.defaultInfo

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
                                ...placedItemAnimal.animalInfo,
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

            // No return value needed for void
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

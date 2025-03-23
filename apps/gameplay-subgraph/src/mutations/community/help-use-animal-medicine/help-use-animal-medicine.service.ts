import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { EnergyService, LevelService, StaticService, SyncService } from "@src/gameplay"
import { HelpUseAnimalMedicineRequest } from "./help-use-animal-medicine.dto"
import { Connection } from "mongoose"
import {
    AnimalCurrentState,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryTypeId,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "kafkajs"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { createObjectId, SchemaStatus, WithStatus, DeepPartial } from "@src/common"

@Injectable()
export class HelpUseAnimalMedicineService {
    private readonly logger = new Logger(HelpUseAnimalMedicineService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly staticService: StaticService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly syncService: SyncService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async helpUseAnimalMedicine(
        { id: userId }: UserLike,
        { placedItemAnimalId }: HelpUseAnimalMedicineRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionMessage: EmitActionPayload | undefined
        let user: UserSchema | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []      
        let neighborUserId: string | undefined
        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY ANIMAL MEDICINE
                 ************************************************************/
                const inventoryAnimalMedicine = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
                        kind: InventoryKind.Tool
                    })
                if (!inventoryAnimalMedicine) {
                    throw new GraphQLError("Animal medicine not found", {
                        extensions: {
                            code: "ANIMAL_MEDICINE_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM ANIMAL
                 ************************************************************/

                // Get placed item animal
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(session)

                // Validate animal exists
                if (!placedItemAnimal) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseAnimalMedicine,
                        success: false,
                        userId,
                        reasonCode: 0
                    }
                    throw new GraphQLError("Placed item animal not found", {
                        extensions: {
                            code: "PLACED_ITEM_ANIMAL_NOT_FOUND"
                        }
                    })
                }

                syncedPlacedItemAction = {
                    id: placedItemAnimalId,
                    placedItemType: placedItemAnimal.placedItemType,
                    x: placedItemAnimal.x,
                    y: placedItemAnimal.y
                }   

                // Validate ownership (must be someone else's animal)
                neighborUserId = placedItemAnimal.user.toString()
                if (neighborUserId === userId) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseAnimalMedicine,
                        success: false,
                        userId,
                        reasonCode: 1
                    }
                    throw new GraphQLError("Cannot help cure your own animal", {
                        extensions: {
                            code: "CANNOT_HELP_CURE_OWN_ANIMAL"
                        }
                    })
                }

                // Validate animal info exists
                if (!placedItemAnimal.animalInfo) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseAnimalMedicine,
                        success: false,
                        userId,
                        reasonCode: 2
                    }
                    throw new GraphQLError("Placed item has no animal", {
                        extensions: {
                            code: "NO_ANIMAL"
                        }
                    })
                }

                // Validate animal is sick
                if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Sick) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseAnimalMedicine,
                        success: false,
                        userId,
                        reasonCode: 3
                    }
                    throw new GraphQLError("Animal is not sick", {
                        extensions: {
                            code: "ANIMAL_IS_NOT_SICK"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/

                // Get activity data
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.helpUseAnimalMedicine

                // Get user data
                user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                // Validate user exists
                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                // Validate energy is sufficient
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * DATA MODIFICATION
                 * Update all data after all validations are complete
                 ************************************************************/

                // Update user energy and experience
                this.energyService.substract({
                    user,
                    quantity: energyConsume
                })
                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Update the user
                await user.save({ session })

                // Update animal state after curing
                placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal
                await placedItemAnimal.save({
                    session
                })
                const syncedPlacedItem = this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                    placedItems: [placedItemAnimal],
                    status: SchemaStatus.Updated
                })
                syncedPlacedItems.push(...syncedPlacedItem)

                // Prepare action message
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.HelpUseAnimalMedicine,
                    success: true,
                    userId
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/

            // Using Promise.all() to send Kafka messages concurrently
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId: neighborUserId, placedItems: syncedPlacedItems }) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [
                        {
                            value: JSON.stringify({
                                userId,
                                user: this.syncService.getSyncedUser(user)
                            })
                        }
                    ]
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
            // withTransaction automatically handles rollback
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

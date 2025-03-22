import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, DeepPartial, SchemaStatus, WithStatus } from "@src/common"
import {
    Activities,
    AnimalCurrentState,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryTypeId,
    KeyValueRecord,
    PlacedItemSchema,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, LevelService, SyncService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { CureAnimalRequest } from "./cure-animal.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class CureAnimalService {
    private readonly logger = new Logger(CureAnimalService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly syncService: SyncService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async cureAnimal(
        { id: userId }: UserLike,
        { placedItemAnimalId }: CureAnimalRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionMessage: EmitActionPayload | undefined
        let user: UserSchema | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []
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
                    throw new GraphQLError("Inventory animal medicine not found", {
                        extensions: {
                            code: "INVENTORY_ANIMAL_MEDICINE_NOT_FOUND"
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
                    throw new GraphQLError("Placed Item animal not found", {
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

                // Validate ownership
                if (placedItemAnimal.user.toString() !== userId) {
                    throw new GraphQLError("Cannot cure another user's animal", {
                        extensions: {
                            code: "CANNOT_CURE_OTHERS_ANIMAL"
                        }
                    })
                }

                // Validate animal is sick
                if (placedItemAnimal.animalInfo?.currentState !== AnimalCurrentState.Sick) {
                    throw new GraphQLError("Animal is not sick", {
                        extensions: {
                            code: "ANIMAL_NOT_SICK"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE ACTIVITY DATA
                 ************************************************************/

                // Get activity data
                const {
                    value: {
                        cureAnimal: { energyConsume, experiencesGain }
                    }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                    .session(session)

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/

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

                // Update user with energy and experience changes
                await user.save({ session })

                // Update animal state after curing
                placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal
                await placedItemAnimal.save({ session })

                const syncedPlacedItem = this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                    placedItems: [placedItemAnimal],
                    status: SchemaStatus.Updated
                })
                syncedPlacedItems.push(...syncedPlacedItem)

                // Prepare action message
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.CureAnimal,
                    success: true,
                    userId
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/

            // Send Kafka messages
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [
                        { value: JSON.stringify({ userId, placedItems: syncedPlacedItems }) }
                    ]
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

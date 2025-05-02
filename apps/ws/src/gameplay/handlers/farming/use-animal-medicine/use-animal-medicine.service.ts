import { Injectable, Logger } from "@nestjs/common"
import { 
    InjectMongoose, 
    InventoryKind, 
    InventorySchema, 
    InventoryTypeId, 
    PlacedItemSchema, 
    AnimalCurrentState,
    UserSchema
} from "@src/databases"
import { EnergyService, LevelService, SyncService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { UseAnimalMedicineMessage } from "./use-animal-medicine.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class UseAnimalMedicineService {
    private readonly logger = new Logger(UseAnimalMedicineService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async useAnimalMedicine(
        { id: userId }: UserLike,
        { placedItemAnimalId }: UseAnimalMedicineMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE ANIMAL MEDICINE
                 ************************************************************/
                // Check if user has animal medicine
                const inventoryMedicineExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
                        kind: InventoryKind.Tool
                    })
                    .session(session)

                // Validate medicine exists in inventory
                if (!inventoryMedicineExisted) {
                    throw new WsException("Animal medicine not found in inventory")
                }

                /************************************************************
                 * RETRIEVE USER DATA
                 ************************************************************/
                // Fetch user
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }

                // Save user snapshot for sync later
                const userSnapshot = user.$clone()

                /************************************************************
                 * RETRIEVE AND VALIDATE ANIMAL DATA
                 ************************************************************/
                // Fetch placed item (animal)
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findOne({
                        _id: placedItemAnimalId,
                        user: userId
                    })
                    .session(session)

                if (!placedItemAnimal) {
                    throw new WsException("Animal not found")
                }

                // Check if the tile has an animal
                if (!placedItemAnimal.animalInfo) {
                    throw new WsException("No animal found on this tile")
                }

                // Check if the animal is sick
                if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Sick) {
                    throw new WsException("Animal is not sick")
                }

                // Add to synced placed items
                syncedPlacedItemAction = {
                    id: placedItemAnimal._id.toString(),
                    x: placedItemAnimal.x,
                    y: placedItemAnimal.y,
                    placedItemType: placedItemAnimal.placedItemType
                }
                // Clone for tracking changes
                const placedItemAnimalSnapshot = placedItemAnimal.$clone()

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                const { energyConsume, experiencesGain } = this.staticService.activities.useAnimalMedicine
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * UPDATE USER ENERGY AND EXPERIENCE
                 ************************************************************/
                // Deduct energy
                this.energyService.subtract({
                    user,
                    quantity: energyConsume
                })

                // Add experience
                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Save user
                await user.save({ session })
                
                // Add to synced user
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                /************************************************************
                 * UPDATE PLACED ITEM ANIMAL
                 ************************************************************/
                // Update animal state to Normal
                placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal

                // Save placed item animal
                await placedItemAnimal.save({ session })

                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem({
                    placedItemSnapshot: placedItemAnimalSnapshot,
                    placedItemUpdated: placedItemAnimal
                })
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action payload
                actionPayload = {
                    action: ActionName.UseAnimalMedicine,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId
                }

                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
                    action: actionPayload
                }
            })

            return result
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionPayload) {
                return {
                    action: actionPayload
                }
            }

            // Rethrow error to be handled higher up
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
} 
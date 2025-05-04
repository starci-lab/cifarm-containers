import { Injectable, Logger } from "@nestjs/common"
import { 
    AnimalCurrentState,
    InjectMongoose, 
    InventorySchema, 
    InventoryKind,
    InventoryTypeId,
    PlacedItemSchema, 
    UserSchema
} from "@src/databases"
import { 
    EnergyService, 
    LevelService, 
    SyncService 
} from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { HelpUseAnimalMedicineMessage } from "./help-use-animal-medicine.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class HelpUseAnimalMedicineService {
    private readonly logger = new Logger(HelpUseAnimalMedicineService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async helpUseAnimalMedicine(
        { id: userId }: UserLike,
        { placedItemAnimalId }: HelpUseAnimalMedicineMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        let watcherUserId: string | undefined

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * CHECK IF YOU HAVE ANIMAL MEDICINE IN TOOLBAR
                 ************************************************************/
                const inventoryAnimalMedicineExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
                        kind: InventoryKind.Tool
                    })
                    .session(session)

                if (!inventoryAnimalMedicineExisted) {
                    throw new WsException("Animal medicine not found in toolbar")
                }
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM ANIMAL
                 ************************************************************/
                // Fetch placed item animal
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(session)

                if (!placedItemAnimal) {
                    throw new WsException("Animal not found")
                }

                // Add to synced placed items for action
                syncedPlacedItemAction = {
                    id: placedItemAnimal.id,
                    x: placedItemAnimal.x,
                    y: placedItemAnimal.y,
                    placedItemType: placedItemAnimal.placedItemType
                }

                const placedItemAnimalSnapshot = placedItemAnimal.$clone()

                // Validate user doesn't own the animal
                watcherUserId = placedItemAnimal.user.toString()
                if (watcherUserId === userId) {
                    throw new WsException("Cannot help your own animal")
                }

                const neighbor = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(watcherUserId)
                    .session(session)

                if (!neighbor) {
                    throw new WsException("Neighbor not found")
                }

                // Validate animal has animal info
                if (!placedItemAnimal.animalInfo) {
                    throw new WsException("Placed item is not an animal")
                }

                // Validate animal needs medicine
                if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Sick) {
                    throw new WsException("Animal does not need medicine")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get activity data
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.helpUseAnimalMedicine

                // Get user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }
                
                if (neighbor.network !== user.network) {
                    throw new WsException("Cannot help neighbor in different network")
                }

                // Save user snapshot for sync later
                const userSnapshot = user.$clone()

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * DATA MODIFICATION
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

                // Apply medicine to the animal - reset to normal state
                placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal
                // Save placed item animal
                await placedItemAnimal.save({ session })

                // Add to synced placed items
                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem({
                    placedItemSnapshot: placedItemAnimalSnapshot,
                    placedItemUpdated: placedItemAnimal
                })
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                actionPayload = {
                    action: ActionName.HelpUseAnimalMedicine,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId
                }

                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
                    action: actionPayload,
                    watcherUserId
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
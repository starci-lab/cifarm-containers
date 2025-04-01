import { Injectable, Logger } from "@nestjs/common"
import { 
    AnimalCurrentState,
    InjectMongoose, 
    InventorySchema, 
    InventoryType,
    InventoryTypeSchema,
    PlacedItemSchema, 
    PlacedItemType,
    ProductType,
    UserSchema
} from "@src/databases"
import { 
    CoreService,
    EnergyService, 
    InventoryService, 
    LevelService, 
    SyncService 
} from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { HarvestAnimalMessage } from "./harvest-animal.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName, HarvestAnimalData } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class HarvestAnimalService {
    private readonly logger = new Logger(HarvestAnimalService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly coreService: CoreService,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async harvestAnimal(
        { id: userId }: UserLike,
        { placedItemAnimalId }: HarvestAnimalMessage
    ): Promise<SyncedResponse<HarvestAnimalData>> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload<HarvestAnimalData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        const syncedInventories: Array<WithStatus<InventorySchema>> = []

        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM ANIMAL
                 ************************************************************/
                // Fetch placed item (animal)
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(session)

                if (!placedItemAnimal) {
                    throw new WsException("Animal not found")
                }

                // Validate ownership
                if (placedItemAnimal.user.toString() !== userId) {
                    throw new WsException("Cannot harvest another user's animal")
                }

                // Validate animal is ready to harvest
                if (placedItemAnimal.animalInfo?.currentState !== AnimalCurrentState.Yield) {
                    throw new WsException("Animal is not ready to harvest")
                }

                // Add to synced placed items for action
                syncedPlacedItemAction = {
                    id: placedItemAnimal.id,
                    x: placedItemAnimal.x,
                    y: placedItemAnimal.y,
                    placedItemType: placedItemAnimal.placedItemType
                }

                const placedItemAnimalSnapshot = placedItemAnimal.$clone()

                /************************************************************
                 * RETRIEVE AND VALIDATE ANIMAL DATA
                 ************************************************************/
                // Get placed item type
                const placedItemType = this.staticService.placedItemTypes.find(
                    placedItemType => placedItemType.id === placedItemAnimal.placedItemType.toString()
                )
                if (!placedItemType) {
                    throw new WsException("Animal data not found")
                }
                // get the animal from the placed item type
                const animal = this.staticService.animals.find(
                    animal => 
                        placedItemType.type === PlacedItemType.Animal &&
                        animal.id === placedItemType.animal.toString()
                )
                if (!animal) {
                    throw new WsException("Animal data not found")
                }

                // Get product data from animal's products in static service
                const product = this.staticService.products.find(
                    product =>
                        product.type === ProductType.Animal &&
                        product.animal.toString() === animal.id
                )
                if (!product) {
                    throw new WsException("Product not found")
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
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/
                // Get inventory type for animal product
                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        type: InventoryType.Product,
                        product: createObjectId(product.displayId)
                    })
                    .session(session)

                if (!inventoryType) {
                    throw new WsException("Inventory type not found")
                }

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Get activity data
                const { energyConsume } = this.staticService.activities.harvestAnimal
                
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

                // Add experience based on quality
                const experiencesGain = placedItemAnimal.animalInfo?.isQuality
                    ? animal.qualityHarvestExperiences
                    : animal.basicHarvestExperiences

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
                 * ADD HARVESTED PRODUCT TO INVENTORY
                 ************************************************************/
                // Get harvest quantity
                const quantity = placedItemAnimal.animalInfo?.harvestQuantityRemaining || 0

                // Get storage capacity
                const { storageCapacity } = this.staticService.defaultInfo

                // Get parameters for adding inventory
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId,
                    session
                })

                // Add the harvested product to inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity,
                    userId,
                    occupiedIndexes
                })

                if (createdInventories.length > 0) {
                    // Create new inventories
                    const createdInventoryRaws = await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session })

                    const createdSyncedInventories =
                        this.syncService.getCreatedSyncedInventories({
                            inventories: createdInventoryRaws
                        })
                    syncedInventories.push(...createdSyncedInventories)
                }

                // Update existing inventories
                for (const { inventorySnapshot, inventoryUpdated } of updatedInventories) {
                    await inventoryUpdated.save({ session })
                    const updatedSyncedInventory =
                        this.syncService.getPartialUpdatedSyncedInventory({
                            inventorySnapshot,
                            inventoryUpdated
                        })
                    syncedInventories.push(updatedSyncedInventory)
                }

                /************************************************************
                 * UPDATE PLACED ITEM ANIMAL
                 ************************************************************/
                // Update animal state after harvest
                this.coreService.updatePlacedItemAnimalAfterHarvest({
                    placedItemAnimal,
                    animal,
                    animalInfo: this.staticService.animalInfo
                })

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

                actionPayload = {
                    action: ActionName.HarvestAnimal,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId,
                    data: {
                        productId: product.id,
                        quantity
                    }
                }
            })

            return {
                user: syncedUser,
                placedItems: syncedPlacedItems,
                inventories: syncedInventories,
                action: actionPayload
            }
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
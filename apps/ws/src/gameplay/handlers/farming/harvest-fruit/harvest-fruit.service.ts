import { Injectable, Logger } from "@nestjs/common"
import { 
    FruitCurrentState,
    InjectMongoose, 
    InventoryKind, 
    InventorySchema,
    InventoryTypeId,
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
import { HarvestFruitMessage } from "./harvest-fruit.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"
import { HarvestFruitData } from "./types"

@Injectable()
export class HarvestFruitService {
    private readonly logger = new Logger(HarvestFruitService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly coreService: CoreService,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async harvestFruit(
        { id: userId }: UserLike,
        { placedItemFruitId }: HarvestFruitMessage
    ): Promise<SyncedResponse<HarvestFruitData>> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload<HarvestFruitData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        const syncedInventories: Array<WithStatus<InventorySchema>> = []

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * CHECK IF YOU HAVE CRATE IN TOOLBAR
                 ************************************************************/
                const inventoryCrateExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.Crate),
                        kind: InventoryKind.Tool
                    })
                    .session(session)

                if (!inventoryCrateExisted) {
                    throw new WsException("Crate not found in toolbar")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM FRUIT
                 ************************************************************/
                // Get placed item fruit
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .session(session)

                // Validate fruit exists
                if (!placedItemFruit) {
                    throw new WsException("Fruit not found")
                }

                // Add to synced placed items for action
                syncedPlacedItemAction = {
                    id: placedItemFruitId,
                    placedItemType: placedItemFruit.placedItemType,
                    x: placedItemFruit.x,
                    y: placedItemFruit.y
                }

                // Validate fruit is planted
                if (!placedItemFruit.fruitInfo) {
                    throw new WsException("Fruit is not planted")
                }

                // Validate fruit is fully matured
                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.FullyMatured) {
                    throw new WsException("Fruit is not fully matured")
                }

                // Save a copy of the placed item for syncing
                const placedItemFruitSnapshot = placedItemFruit.$clone()

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/

                // Get activity data
                const { energyConsume } = this.staticService.activities.harvestFruit

                // Get user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                // Validate user exists
                if (!user) {
                    throw new WsException("User not found")
                }

                // Save user snapshot for sync later
                const userSnapshot = user.$clone()

                // Validate energy is sufficient
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * RETRIEVE AND VALIDATE PRODUCT DATA
                 ************************************************************/

                // Get product data
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.type === PlacedItemType.Fruit &&
                        placedItemType.id === placedItemFruit.placedItemType.toString()
                )
                if (!placedItemType) {
                    throw new WsException("Placed item type not found")
                }
                
                const product = this.staticService.products.find((product) => {
                    return (
                        product.type === ProductType.Fruit &&
                        product.fruit?.toString() === placedItemType.fruit?.toString() &&
                        product.isQuality === placedItemFruit.fruitInfo.isQuality
                    )
                })

                // Validate product exists
                if (!product) {
                    throw new WsException("Product not found from static data")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/

                // Get inventory type
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.product?.toString() === product.id.toString()
                )

                // Validate inventory type exists
                if (!inventoryType) {
                    throw new WsException("Inventory type not found from static data")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE FRUIT DATA
                 ************************************************************/

                // Get fruit data
                const fruit = this.staticService.fruits.find(
                    (fruit) => fruit.id === placedItemType.fruit?.toString()
                )
                if (!fruit) {
                    throw new WsException("Fruit not found from static data")
                }

                /************************************************************
                 * DATA MODIFICATION
                 * Update all data after all validations are complete
                 ************************************************************/

                // Update user energy and experience
                this.energyService.subtract({
                    user,
                    quantity: energyConsume
                })

                const experiencesGain = placedItemFruit.fruitInfo.isQuality
                    ? fruit.qualityHarvestExperiences
                    : fruit.basicHarvestExperiences
                    
                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Get parameters for adding inventory
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId,
                    session
                })

                // Get storage capacity setting
                const { storageCapacity } = this.staticService.defaultInfo

                // Harvest quantity
                const quantity = placedItemFruit.fruitInfo.harvestQuantityRemaining

                // Add the harvested fruit to the inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity,
                    userId,
                    occupiedIndexes
                })

                // Create new inventories
                if (createdInventories.length > 0) {
                    const createdInventoryRaws = await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session })
                        
                    const createdSyncedInventories = this.syncService.getCreatedSyncedInventories({
                        inventories: createdInventoryRaws
                    })
                    syncedInventories.push(...createdSyncedInventories)
                }

                // Update existing inventories
                for (const { inventorySnapshot, inventoryUpdated } of updatedInventories) {
                    await inventoryUpdated.save({ session })
                    const updatedSyncedInventories = this.syncService.getPartialUpdatedSyncedInventory({
                        inventorySnapshot,
                        inventoryUpdated
                    })
                    syncedInventories.push(updatedSyncedInventories)
                }

                // Handle perennial fruit growth cycle
                this.coreService.updatePlacedItemFruitAfterHarvest({
                    placedItemFruit,
                    fruit,
                    fruitInfo: this.staticService.fruitInfo
                })

                // Save user
                await user.save({ session })
                
                // Add to synced user
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                // Save placed item fruit changes
                await placedItemFruit.save({ session })
                
                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem({
                    placedItemSnapshot: placedItemFruitSnapshot,
                    placedItemUpdated: placedItemFruit
                })
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                // Prepare action message
                actionPayload = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.HarvestFruit,
                    success: true,
                    userId,
                    data: {
                        productId: product.displayId,
                        quantity
                    }
                }

                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
                    inventories: syncedInventories,
                    action: actionPayload
                }
            })

            return result
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionPayload) {
                actionPayload.success = false
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
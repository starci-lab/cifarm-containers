import { Injectable, Logger } from "@nestjs/common"
import { InventorySchema, PlacedItemSchema, UserSchema } from "@src/databases"
import { SchemaStatus, WithStatus } from "@src/common"
import {
    GetDeletedSyncedInventoriesParams,
    GetCreatedOrUpdatedSyncedInventoriesParams,
    GetDeletedSyncedPlacedItemsParams,
    GetCreatedOrUpdatedSyncedPlacedItemsParams,
} from "./types"
@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name)

    constructor() {}

    public getCreatedOrUpdatedSyncedInventories({
        inventories,
        status = SchemaStatus.Created
    }: GetCreatedOrUpdatedSyncedInventoriesParams): Array<WithStatus<InventorySchema>> {
        // get field needed, exclude
        const syncedInventories = inventories.map((inventory) => {
            const inventoryJson = inventory.toJSON({
                flattenObjectIds: true
            }) as InventorySchema
            // Remove createdAt and updatedAt fields
            return {
                ...inventoryJson,
                status
            }
        })

        return syncedInventories
    }

    public getDeletedSyncedInventories({
        inventoryIds
    }: GetDeletedSyncedInventoriesParams): Array<WithStatus<InventorySchema>> {
        return inventoryIds.map((inventoryId) => ({
            id: inventoryId,
            status: SchemaStatus.Deleted
        }))
    }

    public getCreatedOrUpdatedSyncedPlacedItems({
        placedItems,
        status = SchemaStatus.Created
    }: GetCreatedOrUpdatedSyncedPlacedItemsParams): Array<WithStatus<PlacedItemSchema>> {
        // get field needed, exclude
        const syncedPlacedItems = placedItems.map((placedItem) => {
            const placedItemJson = placedItem.toJSON({
                flattenObjectIds: true,
            }) as PlacedItemSchema
            // Remove createdAt and updatedAt fields
            // id: 1,
            // x: 1,
            // y: 1,
            // placedItemType: 1,
            // "cropInfo.currentPerennialCount": 1,
            // "cropInfo.crop": 1,
            // "cropInfo.currentStage": 1,
            // "cropInfo.currentState": 1,
            // "cropInfo.harvestQuantityRemaining": 1,
            // "cropInfo.isFertilized": 1,
            // "cropInfo.isQuality": 1,
            // "cropInfo.thieves": 1,
            // "cropInfo.currentStageTimeElapsed": 1,
            // "buildingInfo.currentUpgrade": 1,
            // "animalInfo.currentGrowthTime": 1,
            // "animalInfo.currentHungryTime": 1,
            // "animalInfo.currentYieldTime": 1,
            // "animalInfo.harvestQuantityRemaining": 1,
            // "animalInfo.isAdult": 1,
            // "animalInfo.isQuality": 1,
            // "animalInfo.thieves": 1,
            // "fruitInfo.currentStage": 1,
            // "fruitInfo.currentStageTimeElapsed": 1,
            // "fruitInfo.currentState": 1,
            // "fruitInfo.harvestQuantityRemaining": 1,
            // "fruitInfo.isQuality": 1,
            // "fruitInfo.thieves": 1
            return {
                ...placedItemJson,
                status
            }
        })

        return syncedPlacedItems
    }

    public getDeletedSyncedPlacedItems({
        placedItemIds
    }: GetDeletedSyncedPlacedItemsParams): Array<WithStatus<PlacedItemSchema>> {
        return placedItemIds.map((placedItemId) => ({
            id: placedItemId,
            status: SchemaStatus.Deleted
        }))
    }

    public getSyncedUser(
        user: UserSchema
    ): UserSchema {
        return user.toObject({
            flattenObjectIds: true
        })
    }
}
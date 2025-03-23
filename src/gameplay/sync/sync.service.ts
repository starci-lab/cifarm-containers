import { Injectable, Logger } from "@nestjs/common"
import { InventorySchema, PlacedItemSchema, UserSchema } from "@src/databases"
import { SchemaStatus, WithStatus } from "@src/common"
import {
    GetDeletedSyncedInventoriesParams,
    GetCreatedSyncedInventoriesParams,
    GetDeletedSyncedPlacedItemsParams,
    GetCreatedOrUpdatedSyncedPlacedItemsParams,
    GetPartialUpdatedSyncedInventoryParams,
    GetPartialUpdatedSyncedUserParams
} from "./types"
import {  } from "../inventory"
import { ObjectService } from "@src/object"
@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name)

    constructor(private readonly objectService: ObjectService) {}

    public getCreatedSyncedInventories({
        inventories,
    }: GetCreatedSyncedInventoriesParams): Array<WithStatus<InventorySchema>> {
        // get field needed, exclude
        const syncedInventories = inventories.map((inventory) => {
            const inventoryJson = inventory.toJSON({
                flattenObjectIds: true
            }) as InventorySchema
            // Remove createdAt and updatedAt fields
            return {
                ...inventoryJson,
                status: SchemaStatus.Created
            }
        })

        return syncedInventories
    }

    public getPartialUpdatedSyncedInventory({
        inventorySnapshot,
        inventoryUpdated
    }: GetPartialUpdatedSyncedInventoryParams): WithStatus<InventorySchema> {
        const inventory = this.objectService.getDifferenceBetweenObjects(
            inventorySnapshot.toJSON({
                flattenObjectIds: true
            }),
            inventoryUpdated.toJSON({
                flattenObjectIds: true
            }),
            {
                excludeKey: "id"
            }
        )
        return {
            ...inventory,
            status: SchemaStatus.Updated
        }
    }

    public getPartialUpdatedSyncedUser({
        userSnapshot,
        userUpdated
    }: GetPartialUpdatedSyncedUserParams): WithStatus<UserSchema> {
        const user = this.objectService.getDifferenceBetweenObjects(userSnapshot.toJSON({
            flattenObjectIds: true
        }), userUpdated.toJSON({
            flattenObjectIds: true
        }), {
            excludeKey: "id"
        })
        return { ...user, status: SchemaStatus.Updated }
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
                flattenObjectIds: true
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

    public getSyncedUser(user: UserSchema): UserSchema {
        return user.toObject({
            flattenObjectIds: true
        })
    }
}

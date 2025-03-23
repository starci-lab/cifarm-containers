import { Injectable, Logger } from "@nestjs/common"
import { InventorySchema, PlacedItemSchema, UserSchema } from "@src/databases"
import { SchemaStatus, WithStatus } from "@src/common"
import {
    GetDeletedSyncedInventoriesParams,
    GetCreatedSyncedInventoriesParams,
    GetDeletedSyncedPlacedItemsParams,
    GetPartialUpdatedSyncedInventoryParams,
    GetPartialUpdatedSyncedUserParams,
    GetCreatedSyncedPlacedItemsParams,
    GetPartialUpdatedSyncedPlacedItemParams
} from "./types"
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

    public getPartialUpdatedSyncedPlacedItem({
        placedItemSnapshot,
        placedItemUpdated
    }: GetPartialUpdatedSyncedPlacedItemParams): WithStatus<PlacedItemSchema> {
        const placedItem = this.objectService.getDifferenceBetweenObjects(placedItemSnapshot.toJSON({
            flattenObjectIds: true
        }), placedItemUpdated.toJSON({
            flattenObjectIds: true
        }), {
            excludeKey: "id"
        })
        return { ...placedItem, status: SchemaStatus.Updated }
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

    public getCreatedSyncedPlacedItems({
        placedItems,
    }: GetCreatedSyncedPlacedItemsParams): Array<WithStatus<PlacedItemSchema>> {
        // get field needed, exclude
        const syncedPlacedItems = placedItems.map((placedItem) => {
            const placedItemJson = placedItem.toJSON({
                flattenObjectIds: true
            }) as PlacedItemSchema
            return {
                ...placedItemJson,
                status: SchemaStatus.Created
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

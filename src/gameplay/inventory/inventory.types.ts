import { InventorySchema, InventoryTypeSchema } from "@src/databases"
import { DeepPartial } from "typeorm"

export interface AddParams {
    // inventories with the same type key
    inventories: Array<DeepPartial<InventorySchema>>
    // inventory type
    inventoryType: DeepPartial<InventoryTypeSchema>
    // quantity to add
    quantity: number
}

export interface AddResult {
    updatedInventories: Array<DeepPartial<InventorySchema>>
    createdInventories: Array<DeepPartial<InventorySchema>>
}

export interface RemoveParams {
    // inventories with the same type key
    inventories: Array<DeepPartial<InventorySchema>>
    // quantity to remove
    quantity: number
}

export interface RemoveResult {
    updatedInventories: Array<DeepPartial<InventorySchema>>
    removedInventories: Array<DeepPartial<InventorySchema>>
}

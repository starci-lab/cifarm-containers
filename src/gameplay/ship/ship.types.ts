import { InventorySchema } from "@src/databases"
import { ClientSession } from "mongoose"

export interface PartitionInventoriesParams {
    userId: string
    session: ClientSession
    bulkId: string
}


export interface InventoryMapData {
    inventories: Array<InventorySchema>
    totalQuantity: number
    enough: boolean
    requiredQuantity: number
}

export interface PartitionInventoriesResult {
    inventoryMap: Record<string, InventoryMapData>
}

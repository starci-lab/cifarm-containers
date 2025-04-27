import { InventorySchema } from "@src/databases"
import { ClientSession } from "mongoose"

export interface PartitionInventoriesParams {
    userId: string
    session: ClientSession
}


export interface InventoryMapData {
    inventories: Array<InventorySchema>
    totalQuantity: number
    enough: boolean
}

export interface PartitionInventoriesResult {
    inventoryMap: Record<string, InventoryMapData>
}

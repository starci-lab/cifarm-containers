import { InventorySchema } from "@src/databases"
import { DeepPartial, WithStatus } from "@src/common"

export interface SyncInventoriesPayload {
    data: Array<WithStatus<DeepPartial<InventorySchema>>>
    userId: string
}

export interface InventoriesSyncedMessage {
    data: Array<WithStatus<InventorySchema>>
}





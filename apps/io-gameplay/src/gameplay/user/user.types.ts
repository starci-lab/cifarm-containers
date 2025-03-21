import { UserSchema, InventorySchema } from "@src/databases"
import { DeepPartial, WithStatus } from "@src/common"

export interface SyncUserPayload {
    user: DeepPartial<UserSchema>
    userId: string
}

export interface SyncInventoriesPayload {
    inventories: Array<WithStatus<DeepPartial<InventorySchema>>>
    userId: string
}

export interface InventoriesSyncedMessage {
    data: Array<WithStatus<InventorySchema>>
}

export interface UserSyncedMessage {
    data: DeepPartial<UserSchema>
}






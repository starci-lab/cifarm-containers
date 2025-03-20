import { UserSchema, InventorySchema } from "@src/databases"

export interface SyncUserPayload {
    user?: UserSchema
    userId?: string
    requireQuery?: boolean
}

export interface SyncInventoriesPayload {
    inventories?: Array<InventorySchema>
    userId?: string
    requireQuery?: boolean
}

export interface InventorySyncedMessage {
    inventories: Array<InventorySchema>
}

export interface UserSyncedMessage {
    user: UserSchema
}






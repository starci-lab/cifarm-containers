import { InventorySchema, PlacedItemSchema, UserSchema } from "@src/databases"
import { DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload } from "../emitter/actions/types"
    
// base response for all handlers
export type SyncedResponse<TData = undefined> = Partial<{
    inventories: Array<WithStatus<InventorySchema>>
    user: DeepPartial<UserSchema>
    placedItems: Array<WithStatus<PlacedItemSchema>>
    action: EmitActionPayload<TData>
    /// watcher user id for broadcast the placed items
    watcherUserId: string
}>

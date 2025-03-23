import { InventorySchema, PlacedItemSchema, UserSchema } from "@src/databases"
import { WithStatus, DeepPartial } from "@src/common"
import { EmitActionPayload } from "./emitter"

export enum EmitterEventName {
    UserSynced = "user_synced",
    PlacedItemsSynced = "placed_items_synced",
    ActionEmitted = "action_emitted",
    InventoriesSynced = "inventories_synced"
}

export enum ReceiverEventName {
    SyncPlacedItems = "sync_placed_items",
    BuyCropSeeds = "buy_crop_seeds",
    BuyFlowerSeeds = "buy_flower_seeds",
    BuySupplies = "buy_supplies",
    BuyTool = "buy_tool",
    BuyFruit = "buy_fruit",
    BuyAnimal = "buy_animal",
    BuyBuilding = "buy_building",
    BuyTile = "buy_tile"
}

// sync placed items
export interface SyncPlacedItemsMessage {
    placedItemIds: Array<string>
}

// sync user
export interface UserSyncedMessage {
    data: DeepPartial<UserSchema>
}

// sync inventories
export interface InventoriesSyncedMessage {
    data: Array<WithStatus<InventorySchema>>
}

// sync placed items
export interface PlacedItemsSyncedMessage {
    data: Array<WithStatus<PlacedItemSchema>>
}

// generic type for action emitted message
export interface ActionEmittedMessage<TData = undefined> {
    action: EmitActionPayload<TData>
}
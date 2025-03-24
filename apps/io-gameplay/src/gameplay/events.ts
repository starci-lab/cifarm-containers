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
    BuyTile = "buy_tile",
    PlantSeed = "plant_seed",
    HarvestPlant = "harvest_plant",
    UseHerbicide = "use_herbicide",
    UsePesticide = "use_pesticide",
    HarvestAnimal = "harvest_animal",
    UseAnimalFeed = "use_animal_feed",
    UseAnimalMedicine = "use_animal_medicine",
    UseFertilizer = "use_fertilizer",
    UseWateringCan = "use_watering_can",
    HarvestFruit = "harvest_fruit",
    UseBugNet = "use_bug_net",
    UseFruitFertilizer = "use_fruit_fertilizer",
    // Community features
    HelpUseHerbicide = "help_use_herbicide",
    HelpUsePesticide = "help_use_pesticide",
    HelpUseWateringCan = "help_use_watering_can",
    HelpUseAnimalMedicine = "help_use_animal_medicine",
    HelpUseBugNet = "help_use_bug_net",
    ThiefPlant = "thief_plant",
    ThiefAnimal = "thief_animal",
    ThiefFruit = "thief_fruit",
    // Delivery features
    DeliverProduct = "deliver_product",
    DeliverMoreProduct = "deliver_more_product",
    RetainProduct = "retain_product"
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
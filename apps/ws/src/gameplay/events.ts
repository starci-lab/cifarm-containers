import { InventorySchema, PlacedItemSchema, UserSchema } from "@src/databases"
import { WithStatus, DeepPartial } from "@src/common"
import { EmitActionPayload } from "./emitter"

export enum EmitterEventName {
    UserSynced = "user_synced",
    PlacedItemsSynced = "placed_items_synced",
    ActionEmitted = "action_emitted",
    InventoriesSynced = "inventories_synced",
    CropSeedsBought = "crop_seeds_bought",
    FlowerSeedsBought = "flower_seeds_bought",
    SuppliesBought = "supplies_bought",
    ToolBought = "tool_bought",
    DailyRewardClaimed = "daily_reward_claimed",
    // method to indicate whether the user can continue buying items
    StopBuying = "stop_buying",
    DisplayTimersResponsed = "display_timers_responsed",
}

export enum ReceiverEventName {
    RequestDisplayTimers = "request_display_timers",
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
    DeliverInventory = "deliver_inventory",
    DeliverAdditionalInventory = "deliver_additional_inventory",
    RetainInventory = "retain_inventory",
    MoveInventory = "move_inventory",
    ClaimDailyReward = "claim_daily_reward",
    Visit = "visit",
    Return = "return",
    // Placements
    Move = "move",
    Sell = "sell",
    UpgradeBuilding = "upgrade_building",
    HarvestBeeHouse = "harvest_bee_house",
    ThiefBeeHouse = "thief_bee_house",
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
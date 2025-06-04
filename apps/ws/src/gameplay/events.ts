import { InventorySchema, PlacedItemSchema, UserSchema } from "@src/databases"
import { WithStatus, DeepPartial } from "@src/common"
import { EmitActionPayload } from "./emitter"

export enum EmitterEventName {
    UserSynced = "user_synced",
    PlacedItemsSynced = "placed_items_synced",
    ActionEmitted = "action_emitted",
    InventoriesSynced = "inventories_synced",
    BuyCropSeedsResponsed = "buy_crop_seeds_responsed",
    BuyFlowerSeedsResponsed = "buy_flower_seeds_responsed",
    BuySuppliesResponsed = "buy_supplies_responsed",
    BuyToolResponsed = "buy_tool_responsed",
    PlantHarvestedResponsed = "plant_harvested_responsed",
    UseFruitFertilizerResponsed = "use_fruit_fertilizer_responsed",
    UseWateringCanResponsed = "use_watering_can_responsed",
    UseHerbicideResponsed = "use_herbicide_responsed",
    UsePesticideResponsed = "use_pesticide_responsed",
    ClaimDailyRewardResponsed = "claim_daily_reward_responsed",
    // method to indicate whether the user can continue buying items
    StopBuying = "stop_buying",
    // force sync placed items
    ForceSyncPlacedItemsResponsed = "force_sync_placed_items_responsed",
    YourAccountHasBeenLoggedInFromAnotherDevice = "your_account_has_been_logged_in_from_another_device"
}

export enum ReceiverEventName {
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
    RemovePlant = "remove_plant",
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
    DeliverInventories = "deliver_inventories",
    RetrieveInventories = "retrieve_inventories",
    MoveInventory = "move_inventory",
    MoveInventoryWholesaleMarket = "move_inventory_wholesale_market",
    ClaimDailyReward = "claim_daily_reward",
    Visit = "visit",
    Return = "return",
    // Placements
    Move = "move",
    Sell = "sell",
    UpgradeBuilding = "upgrade_building",
    HarvestBeeHouse = "harvest_bee_house",
    ThiefBeeHouse = "thief_bee_house",
    BuyPet = "buy_pet",
    PlaceNFT = "place_nft",
    ForceSyncPlacedItems = "force_sync_placed_items",
    // Player
    UpdateSettings = "update_settings",
    UpdateProfile = "update_profile",
    // Pets
    SelectDog = "select_dog",
    SelectCat = "select_cat",
    // Inventories
    SortInventories = "sort_inventories",
    DeleteInventory = "delete_inventory",
    UpdateTutorial = "update_tutorial"
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
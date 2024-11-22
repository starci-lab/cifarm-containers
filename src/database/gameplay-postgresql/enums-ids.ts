// Animal Enum
export enum AnimalId {
    Chicken = "chicken",
    Cow = "cow",
    Pig = "pig",
    Sheep = "sheep"
}

// Building Enum
export enum BuildingId {
    Coop = "coop",
    Pasture = "pasture",
    Home = "home"
}

// Upgrade Enum
export enum UpgradeId {
    CoopUpgrade1 = "coopUpgrade1",
    CoopUpgrade2 = "coopUpgrade2",
    CoopUpgrade3 = "coopUpgrade3",
    PastureUpgrade1 = "pastureUpgrade1",
    PastureUpgrade2 = "pastureUpgrade2",
    PastureUpgrade3 = "pastureUpgrade3"
}

// Crop Enum
export enum CropId {
    Carrot = "carrot",
    Potato = "potato",
    Pineapple = "pineapple",
    Watermelon = "watermelon",
    Cucumber = "cucumber",
    BellPepper = "bellPepper"
}

// Daily Reward Enum
export enum DailyRewardId {
    Day1 = "day1",
    Day2 = "day2",
    Day3 = "day3",
    Day4 = "day4",
    Day5 = "day5"
}

// Daily Reward Possibility Enum
export enum DailyRewardPossibilityId {
    Possibility1 = "possibility1",
    Possibility2 = "possibility2",
    Possibility3 = "possibility3",
    Possibility4 = "possibility4",
    Possibility5 = "possibility5"
}

// Supply Enum
export enum SupplyId {
    BasicFertilizer = "basic_fertilizer",
    AnimalFeed = "animal_feed"
}

// Spin Enum
export enum SpinId {
    Gold1 = "gold1",
    Gold2 = "gold2",
    Gold3 = "gold3",
    Gold4 = "gold4",
    Seed1 = CropId.Pineapple,
    Seed2 = CropId.Watermelon,
    BasicFertilizer = SupplyId.BasicFertilizer,
    Token = "token"
}

// Tile Enum
export enum TileId {
    StarterTile = "starterTile",
    BasicTile1 = "basicTile1",
    BasicTile2 = "basicTile2",
    BasicTile3 = "basicTile3",
    FertileTile = "fertileTile"
}

// Tool Enum
export enum ToolId {
    Scythe = "scythe",
    Steal = "steal",
    WaterCan = "watercan",
    Herbicide = "herbicide",
    Pesticide = "pesticide"
}

// Product Enum
export enum ProductId {
    Egg = "egg",
    Milk = "milk",
    Carrot = "carrot",
    Potato = "potato",
    Pineapple = "pineapple",
    Watermelon = "watermelon",
    Cucumber = "cucumber",
    BellPepper = "bellPepper"
}

export enum SystemId {
    Activities = "activities",
}
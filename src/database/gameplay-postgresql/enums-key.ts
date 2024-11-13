import { registerEnumType } from "@nestjs/graphql"

export enum AnimalKey {
    Chicken = "Chicken",
    Cow = "Cow",
    Pig = "Pig",
    Sheep = "Sheep",
}

registerEnumType(AnimalKey, {
    name: "AnimalKey",
})

export enum BuildingKey {
    Coop = "Coop",
    Pasture = "Pasture",
    Home = "Home",
}
registerEnumType(BuildingKey, {
    name: "BuildingKey"
})

export enum UpgradeKey{
    Coop_Upgrade1 = "Coop_Upgrade1",
    Coop_Upgrade2 = "Coop_Upgrade2",
    Coop_Upgrade3 = "Coop_Upgrade3",
    Pasture_Upgrade1 = "Pasture_Upgrade1",
    Pasture_Upgrade2 = "Pasture_Upgrade2",
    Pasture_Upgrade3 = "Pasture_Upgrade3",
}

registerEnumType(UpgradeKey, {
    name: "UpgradeKey"
})

export enum CropKey {
    Carrot = "Carrot",
    Potato = "Potato",
    Pineapple = "Pineapple",
    Watermelon = "Watermelon",
    Cucumber = "Cucumber",
    BellPepper = "BellPepper",
}

registerEnumType(CropKey, {
    name: "CropKey"
})

export enum DailyRewardKey {
    Day1 = "Day1",
    Day2 = "Day2",
    Day3 = "Day3",
    Day4 = "Day4",
    Day5 = "Day5",
}

registerEnumType(DailyRewardKey, {
    name: "DailyRewardKey"
})

export enum DailyRewardPossibilityKey {
    Possibility1 = "Possibility1",
    Possibility2 = "Possibility2",
    Possibility3 = "Possibility3",
    Possibility4 = "Possibility4",
    Possibility5 = "Possibility5",
}

registerEnumType(DailyRewardPossibilityKey, {
    name: "DailyRewardPossibilityKey"
})

export enum SupplyKey {
    BasicFertilizer = "BasicFertilizer",
    AnimalFeed = "AnimalFeed",
}

registerEnumType(SupplyKey, {
    name: "SupplyKey"
})

export enum SpinKey {
    Gold1 = "Gold1",
    Gold2 = "Gold2",
    Gold3 = "Gold3",
    Gold4 = "Gold4",
    Seed1 = CropKey.Pineapple,
    Seed2 = CropKey.Watermelon,
    BasicFertilizer = SupplyKey.BasicFertilizer,
    Token = "Token",
}

registerEnumType(SpinKey, {
    name: "SpinKey"
})

export enum TileKey {
    StarterTile = "StarterTile",
    BasicTile1 = "BasicTile1",
    BasicTile2 = "BasicTile2",
    BasicTile3 = "BasicTile3",
    FertileTile = "FertileTile",
}
registerEnumType(TileKey, {
    name: "TileKey",
})

export enum ToolKey {
    Scythe = "Scythe",
    Steal = "Steal",
    WaterCan = "WaterCan",
    Herbicide = "Herbicide",
    Pesticide = "Pesticide",
}
registerEnumType(ToolKey, {
    name: "ToolKey"
})


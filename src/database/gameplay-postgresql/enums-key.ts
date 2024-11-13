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
import { registerEnumType } from "@nestjs/graphql"

// Animal Enum
export enum AnimalId {
    Chicken = "chicken",
    Cow = "cow",
    Pig = "pig",
    Sheep = "sheep"
}

registerEnumType(AnimalId, {
    name: "AnimalId",
    description: "The animal id.",
    valuesMap: {
        Chicken: {
            description: "The chicken id.",
        },
        Cow: {
            description: "The cow id.",
        },
    },
})

export const animalIdResolver: Record<keyof typeof AnimalId, string> = {
    Chicken: AnimalId.Chicken,
    Cow: AnimalId.Cow,
    Pig: AnimalId.Pig,
    Sheep: AnimalId.Sheep
}

// Building Enum
export enum BuildingId {
    Coop = "coop",
    Barn = "barn",
    Home = "home"
}

registerEnumType(BuildingId, {
    name: "BuildingId",
    description: "The building id.",
    valuesMap: {
        Coop: {
            description: "The coop id.",
        },
    },
})

export const buildingIdResolver: Record<keyof typeof BuildingId, string> = {
    Coop: BuildingId.Coop,
    Barn: BuildingId.Barn,
    Home: BuildingId.Home
}

// Upgrade Enum
export enum UpgradeKey {
    CoopUpgrade1 = "coopUpgrade1",
    CoopUpgrade2 = "coopUpgrade2",
    CoopUpgrade3 = "coopUpgrade3",
    BarnUpgrade1 = "barnUpgrade1",
    BarnUpgrade2 = "barnUpgrade2",
    BarnUpgrade3 = "barnUpgrade3"
}

registerEnumType(UpgradeKey, {
    name: "UpgradeKey",
    description: "The upgrade key.",
    valuesMap: {
        CoopUpgrade1: {
            description: "The coop upgrade 1 key.",
        },
    },
})

export const upgradeKeyResolver: Record<keyof typeof UpgradeKey, string> = {
    CoopUpgrade1: UpgradeKey.CoopUpgrade1,
    CoopUpgrade2: UpgradeKey.CoopUpgrade2,
    CoopUpgrade3: UpgradeKey.CoopUpgrade3,
    BarnUpgrade1: UpgradeKey.BarnUpgrade1,
    BarnUpgrade2: UpgradeKey.BarnUpgrade2,
    BarnUpgrade3: UpgradeKey.BarnUpgrade3
}

// Crop Enum
export enum CropId {
    Turnip = "turnip",
    Carrot = "carrot",
    Potato = "potato",
    Pineapple = "pineapple",
    Watermelon = "watermelon",
    Cucumber = "cucumber",
    BellPepper = "bellPepper"
}

registerEnumType(CropId, {
    name: "CropId",
    description: "The crop id.",
    valuesMap: {
        Turnip: {
            description: "The turnip id.",
        },
    },
})

export const cropIdResolver: Record<keyof typeof CropId, string> = {
    Turnip: CropId.Turnip,
    Carrot: CropId.Carrot,
    Potato: CropId.Potato,
    Pineapple: CropId.Pineapple,
    Watermelon: CropId.Watermelon,
    Cucumber: CropId.Cucumber,
    BellPepper: CropId.BellPepper
}

// Fruit Enum
export enum FruitId {
    Banana = "banana",
    Apple = "apple",
}

registerEnumType(FruitId, {
    name: "FruitId",
    description: "The fruit id.",
    valuesMap: {
        Banana: {
            description: "The banana id.",
        },
    },
})

export const fruitIdResolver: Record<keyof typeof FruitId, string> = {
    Banana: FruitId.Banana,
    Apple: FruitId.Apple,
}

// Daily Reward Enum
export enum DailyRewardId {
    Day1 = "day1",
    Day2 = "day2",
    Day3 = "day3",
    Day4 = "day4",
    Day5 = "day5"
}

registerEnumType(DailyRewardId, {
    name: "DailyRewardId",
    description: "The daily reward id.",
    valuesMap: {
        Day1: {
            description: "The day 1 reward id.",
        },
        Day2: {
            description: "The day 2 reward id.",
        },
        Day3: {
            description: "The day 3 reward id.",
        },  
        Day4: {
            description: "The day 4 reward id.",
        },
        Day5: {
            description: "The day 5 reward id.",
        },
    },
})

export const dailyRewardIdResolver: Record<keyof typeof DailyRewardId, string> = {
    Day1: DailyRewardId.Day1,
    Day2: DailyRewardId.Day2,
    Day3: DailyRewardId.Day3,
    Day4: DailyRewardId.Day4,
    Day5: DailyRewardId.Day5
}

// Supply Enum
export enum SupplyId {
    BasicFertilizer = "basicFertilizer",
    AnimalFeed = "animalFeed",
    FruitFertilizer = "fruitFertilizer",
}

registerEnumType(SupplyId, {
    name: "SupplyId",
    description: "The supply id.",
    valuesMap: {
        BasicFertilizer: {
            description: "The basic fertilizer id.",
        },
        AnimalFeed: {
            description: "The animal feed id.",
        },
        FruitFertilizer: {
            description: "The fruit fertilizer id.",
        },
    },
})

export const supplyIdResolver: Record<keyof typeof SupplyId, string> = {
    BasicFertilizer: SupplyId.BasicFertilizer,
    AnimalFeed: SupplyId.AnimalFeed,
    FruitFertilizer: SupplyId.FruitFertilizer
}

// Tile Enum
export enum TileId {
    BasicTile = "basicTile",
}

registerEnumType(TileId, {
    name: "TileId",
    description: "The tile id.",
    valuesMap: {
        BasicTile: {
            description: "The basic tile id.",
        },
    },
})

export const tileIdResolver: Record<keyof typeof TileId, string> = {
    BasicTile: TileId.BasicTile
}

// Tool Enum
export enum ToolId {
    Hand = "hand",
    Crate = "crate",
    ThiefHand = "thiefHand",
    WateringCan = "wateringCan",
    Herbicide = "herbicide",
    Pesticide = "pesticide",
    Hammer = "hammer",
    AnimalMedicine = "animalMedicine",
    BugNet = "bugNet",
}

registerEnumType(ToolId, {
    name: "ToolId",
    description: "The tool id.",
    valuesMap: {
        Hand: {
            description: "The hand id.",
        },
        Crate: {
            description: "The crate id.",
        },
        ThiefHand: {
            description: "The thief hand id.",
        },
        WateringCan: {
            description: "The watering can id.",
        },
        Herbicide: {
            description: "The herbicide id.",
        },
        Pesticide: {
            description: "The pesticide id.",
        },
        Hammer: {
            description: "The hammer id.",
        },
        AnimalMedicine: {
            description: "The animal medicine id.",
        },
        BugNet: {
            description: "The bug net id.",
        },
    },
})

export const toolIdResolver: Record<keyof typeof ToolId, string> = {
    Hand: ToolId.Hand,
    Crate: ToolId.Crate,
    ThiefHand: ToolId.ThiefHand,
    WateringCan: ToolId.WateringCan,
    Herbicide: ToolId.Herbicide,
    Pesticide: ToolId.Pesticide,
    Hammer: ToolId.Hammer,
    AnimalMedicine: ToolId.AnimalMedicine,
    BugNet: ToolId.BugNet
}

// Pet Enum
export enum PetId {
    Dog = "dog",
    Cat = "cat",
}

registerEnumType(PetId, {
    name: "PetId",
    description: "The pet id.",
    valuesMap: {
        Dog: {
            description: "The dog id.",
        },
        Cat: {
            description: "The cat id.",
        },
    },
})

// Product Enum
export enum ProductId {
    Egg = "egg",
    EggQuality = "eggQuality",
    Milk = "milk",
    MilkQuality = "milkQuality",
    Turnip = "turnip",
    TurnipQuality = "turnipQuality",
    Carrot = "carrot",
    CarrotQuality = "carrotQuality",
    Potato = "potato",
    PotatoQuality = "potatoQuality",
    Pineapple = "pineapple",
    PineappleQuality = "pineappleQuality",
    Watermelon = "watermelon",
    WatermelonQuality = "watermelonQuality",
    Cucumber = "cucumber",
    CucumberQuality = "cucumberQuality",
    BellPepper = "bellPepper",
    BellPepperQuality = "bellPepperQuality",
    Banana = "banana",
    BananaQuality = "bananaQuality",
    Apple = "apple",
    AppleQuality = "appleQuality",
}

registerEnumType(ProductId, {
    name: "ProductId",
    description: "The product id.",
    valuesMap: {
        Egg: {
            description: "The egg id.",
        },
        EggQuality: {
            description: "The egg quality id.",
        },
        Milk: {
            description: "The milk id.",
        },
        MilkQuality: {
            description: "The milk quality id.",
        },
        Turnip: {
            description: "The turnip id.",
        },
        TurnipQuality: {
            description: "The turnip quality id.",
        },
        Carrot: {
            description: "The carrot id.",
        },
        CarrotQuality: {
            description: "The carrot quality id.",
        },
        Potato: {
            description: "The potato id.",
        },
        PotatoQuality: {
            description: "The potato quality id.",
        },
        Pineapple: {
            description: "The pineapple id.",
        },
        PineappleQuality: {
            description: "The pineapple quality id.",
        },
        Watermelon: {
            description: "The watermelon id.",
        },
        WatermelonQuality: {
            description: "The watermelon quality id.",
        },
        Cucumber: {
            description: "The cucumber id.",
        },
        CucumberQuality: {
            description: "The cucumber quality id.",
        },
        BellPepper: {
            description: "The bell pepper id.",
        },
        BellPepperQuality: {
            description: "The bell pepper quality id.",
        },
        Banana: {
            description: "The banana id.",
        },
        BananaQuality: {
            description: "The banana quality id.",
        },
        Apple: {
            description: "The apple id.",
        },
        AppleQuality: {
            description: "The apple quality id.",
        },
    },
})

export enum SystemId {
    Activities = "activities",
    CropInfo = "cropInfo",
    AnimalInfo = "animalInfo",
    FruitInfo = "fruitInfo",
    DefaultInfo = "defaultInfo",
    SpinInfo = "spinInfo",
    EnergyRegen = "energyRegen",
    DailyRewardInfo = "dailyRewardInfo",
    HoneycombInfo = "honeycombInfo",
}

registerEnumType(SystemId, {
    name: "SystemId",
    description: "The system id.",
    valuesMap: {
        Activities: {
            description: "The activities id.",
        },
        CropInfo: {
            description: "The crop info id.",
        },
        AnimalInfo: {
            description: "The animal info id.",
        },
        FruitInfo: {
            description: "The fruit info id.",
        },
        DefaultInfo: {
            description: "The default info id.",
        },
        SpinInfo: {
            description: "The spin info id.",
        },
        EnergyRegen: {
            description: "The energy regen id.",
        },
        DailyRewardInfo: {
            description: "The daily reward info id.",
        },
        HoneycombInfo: {
            description: "The honeycomb info id.",
        },
    },
})

export const systemIdResolver: Record<keyof typeof SystemId, string> = {
    Activities: SystemId.Activities,
    CropInfo: SystemId.CropInfo,
    AnimalInfo: SystemId.AnimalInfo,
    FruitInfo: SystemId.FruitInfo,
    DefaultInfo: SystemId.DefaultInfo,
    SpinInfo: SystemId.SpinInfo,
    EnergyRegen: SystemId.EnergyRegen,
    DailyRewardInfo: SystemId.DailyRewardInfo,
    HoneycombInfo: SystemId.HoneycombInfo
}

export enum KeyValueStoreId {
    CropGrowthLastSchedule = "cropGrowthLastSchedule",
    AnimalGrowthLastSchedule = "animalGrowthLastSchedule",
    EnergyRegenerationLastSchedule = "energyRegenerationLastSchedule",
    FruitGrowthLastSchedule = "fruitGrowthLastSchedule",
}

registerEnumType(KeyValueStoreId, {
    name: "KeyValueStoreId",
    description: "The key value store id.",
    valuesMap: {
        CropGrowthLastSchedule: {
            description: "The crop growth last schedule id.",
        },
        AnimalGrowthLastSchedule: {
            description: "The animal growth last schedule id.",
        },
        EnergyRegenerationLastSchedule: {
            description: "The energy regeneration last schedule id.",
        },
        FruitGrowthLastSchedule: {
            description: "The fruit growth last schedule id.",
        },
    },
})

export const keyValueStoreIdResolver: Record<keyof typeof KeyValueStoreId, string> = {
    CropGrowthLastSchedule: KeyValueStoreId.CropGrowthLastSchedule,
    AnimalGrowthLastSchedule: KeyValueStoreId.AnimalGrowthLastSchedule,
    EnergyRegenerationLastSchedule: KeyValueStoreId.EnergyRegenerationLastSchedule,
    FruitGrowthLastSchedule: KeyValueStoreId.FruitGrowthLastSchedule
}

export enum InventoryTypeId {
    TurnipSeed = "turnipSeed",
    CarrotSeed = "carrotSeed",
    PotatoSeed = "potatoSeed",
    PineappleSeed = "pineappleSeed",
    WatermelonSeed = "watermelonSeed",
    CucumberSeed = "cucumberSeed",
    BellPepperSeed = "bellPepperSeed",
    BasicFertilizer = "basicFertilizer",
    AnimalFeed = "animalFeed",
    FruitFertilizer = "fruitFertilizer",
    Egg = "egg",
    EggQuality = "eggQuality",
    Milk = "milk",
    MilkQuality = "milkQuality",
    Turnip = "turnip",
    TurnipQuality = "turnipQuality",
    Carrot = "carrot",
    CarrotQuality = "carrotQuality",
    Potato = "potato",
    PotatoQuality = "potatoQuality",
    Pineapple = "pineapple",
    PineappleQuality = "pineappleQuality",
    Watermelon = "watermelon",
    WatermelonQuality = "watermelonQuality",
    Cucumber = "cucumber",
    CucumberQuality = "cucumberQuality",
    BellPepper = "bellPepper",
    BellPepperQuality = "bellPepperQuality",
    Banana = "banana",
    BananaQuality = "bananaQuality",
    Apple = "apple",
    AppleQuality = "appleQuality",
    Hand = "hand",
    Crate = "crate",
    WateringCan = "wateringCan",
    Hammer = "hammer",
    Herbicide = "herbicide",
    Pesticide = "pesticide",
    AnimalMedicine = "animalMedicine",
    BugNet = "bugNet",
}

registerEnumType(InventoryTypeId, {
    name: "InventoryTypeId",
    description: "The inventory type id.",
    valuesMap: {
        TurnipSeed: {
            description: "The turnip seed id.",
        },
        CarrotSeed: {
            description: "The carrot seed id.",
        },
        PotatoSeed: {
            description: "The potato seed id.",
        },
        PineappleSeed: {
            description: "The pineapple seed id.",
        },
        WatermelonSeed: {
            description: "The watermelon seed id.",
        },
        CucumberSeed: {
            description: "The cucumber seed id.",
        },
        BellPepperSeed: {
            description: "The bell pepper seed id.",
        },
        BasicFertilizer: {
            description: "The basic fertilizer id.",
        },
        AnimalFeed: {
            description: "The animal feed id.",
        },
        FruitFertilizer: {
            description: "The fruit fertilizer id.",
        },
        Egg: {  
            description: "The egg id.",
        },
        EggQuality: {
            description: "The egg quality id.",
        },
        Milk: {
            description: "The milk id.",
        },
        MilkQuality: {
            description: "The milk quality id.",
        },
        Turnip: {
            description: "The turnip id.",
        },
        TurnipQuality: {
            description: "The turnip quality id.",
        },
        Carrot: {
            description: "The carrot id.",
        },
        CarrotQuality: {
            description: "The carrot quality id.",
        },
        Potato: {
            description: "The potato id.",
        },
        PotatoQuality: {
            description: "The potato quality id.",
        },
        Pineapple: {
            description: "The pineapple id.",
        },
        PineappleQuality: {
            description: "The pineapple quality id.",
        },
        Watermelon: {
            description: "The watermelon id.",
        },
        WatermelonQuality: {
            description: "The watermelon quality id.",
        },
        Cucumber: {
            description: "The cucumber id.",
        },
        CucumberQuality: {
            description: "The cucumber quality id.",
        },
        BellPepper: {
            description: "The bell pepper id.",
        },
        BellPepperQuality: {
            description: "The bell pepper quality id.",
        },
        Banana: {
            description: "The banana id.",
        },
        BananaQuality: {
            description: "The banana quality id.",
        },
        Apple: {
            description: "The apple id.",
        },
        AppleQuality: {
            description: "The apple quality id.",
        },
        Hand: {
            description: "The hand id.",
        },
        Crate: {
            description: "The crate id.",
        },
        WateringCan: {
            description: "The watering can id.",
        },
        Hammer: {
            description: "The hammer id.",
        },
        Herbicide: {
            description: "The herbicide id.",
        },
        Pesticide: {
            description: "The pesticide id.",
        },
        AnimalMedicine: {
            description: "The animal medicine id.",
        },
        BugNet: {
            description: "The bug net id.",
        },
    },
})

export const inventoryTypeIdResolver: Record<keyof typeof InventoryTypeId, string> = {
    TurnipSeed: InventoryTypeId.TurnipSeed,
    CarrotSeed: InventoryTypeId.CarrotSeed,
    PotatoSeed: InventoryTypeId.PotatoSeed,
    PineappleSeed: InventoryTypeId.PineappleSeed,
    WatermelonSeed: InventoryTypeId.WatermelonSeed,
    CucumberSeed: InventoryTypeId.CucumberSeed,
    BellPepperSeed: InventoryTypeId.BellPepperSeed,
    BasicFertilizer: InventoryTypeId.BasicFertilizer,
    AnimalFeed: InventoryTypeId.AnimalFeed,
    FruitFertilizer: InventoryTypeId.FruitFertilizer,
    Egg: InventoryTypeId.Egg,
    EggQuality: InventoryTypeId.EggQuality,
    Milk: InventoryTypeId.Milk,
    MilkQuality: InventoryTypeId.MilkQuality,
    Turnip: InventoryTypeId.Turnip,
    TurnipQuality: InventoryTypeId.TurnipQuality,
    Carrot: InventoryTypeId.Carrot,
    CarrotQuality: InventoryTypeId.CarrotQuality,
    Potato: InventoryTypeId.Potato,
    PotatoQuality: InventoryTypeId.PotatoQuality,
    Pineapple: InventoryTypeId.Pineapple,
    PineappleQuality: InventoryTypeId.PineappleQuality,
    Watermelon: InventoryTypeId.Watermelon,
    WatermelonQuality: InventoryTypeId.WatermelonQuality,
    Cucumber: InventoryTypeId.Cucumber,
    CucumberQuality: InventoryTypeId.CucumberQuality,
    BellPepper: InventoryTypeId.BellPepper,
    BellPepperQuality: InventoryTypeId.BellPepperQuality,
    Banana: InventoryTypeId.Banana,
    BananaQuality: InventoryTypeId.BananaQuality,
    Apple: InventoryTypeId.Apple,
    AppleQuality: InventoryTypeId.AppleQuality,
    Hand: InventoryTypeId.Hand,
    Crate: InventoryTypeId.Crate,
    WateringCan: InventoryTypeId.WateringCan,
    Hammer: InventoryTypeId.Hammer,
    Herbicide: InventoryTypeId.Herbicide,
    Pesticide: InventoryTypeId.Pesticide,
    AnimalMedicine: InventoryTypeId.AnimalMedicine,
    BugNet: InventoryTypeId.BugNet
}

export enum PlacedItemTypeId {
    Chicken = "chicken",
    Cow = "cow",
    Pig = "pig",
    Sheep = "sheep",
    Coop = "coop",
    Barn = "barn",
    Home = "home",
    BasicTile = "basicTile",
    Apple = "apple",
    Banana = "banana"
}

registerEnumType(PlacedItemTypeId, {
    name: "PlacedItemTypeId",
    description: "The placed item type id.",
    valuesMap: {
        Chicken: {
            description: "The chicken id.",
        },
        Cow: {
            description: "The cow id.",
        },
        Pig: {
            description: "The pig id.",
        },
        Sheep: {
            description: "The sheep id.",
        },
        Coop: {
            description: "The coop id.",
        },
        Barn: {
            description: "The barn id.",
        },
        Home: {
            description: "The home id.",
        },
        BasicTile: {
            description: "The basic tile id.",
        },
        Apple: {
            description: "The apple id.",
        },  
        Banana: {
            description: "The banana id.",
        },
    },
})

export const placedItemTypeIdResolver: Record<keyof typeof PlacedItemTypeId, string> = {
    Chicken: PlacedItemTypeId.Chicken,
    Cow: PlacedItemTypeId.Cow,
    Pig: PlacedItemTypeId.Pig,
    Sheep: PlacedItemTypeId.Sheep,
    Coop: PlacedItemTypeId.Coop,    
    Barn: PlacedItemTypeId.Barn,
    Home: PlacedItemTypeId.Home,
    BasicTile: PlacedItemTypeId.BasicTile,
    Apple: PlacedItemTypeId.Apple,
    Banana: PlacedItemTypeId.Banana
}





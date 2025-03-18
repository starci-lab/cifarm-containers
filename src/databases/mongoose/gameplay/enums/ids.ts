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
        Barn: {
            description: "The barn id.",
        },
        Home: {
            description: "The home id.",
        },
    },
})

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
        Carrot: {
            description: "The carrot id.",
        },
        Potato: {
            description: "The potato id.",
        },
        Pineapple: {
            description: "The pineapple id.",
        },
        Watermelon: {
            description: "The watermelon id.",
        },
        Cucumber: {
            description: "The cucumber id.",
        },
        BellPepper: {
            description: "The bell pepper id.",
        },
    },
})

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
        Apple: {
            description: "The apple id.",
        },
    },
})

// Daily Reward Enum
export enum DailyRewardId {
    Day1 = "day1",
    Day2 = "day2",
    Day3 = "day3",
    Day4 = "day4",
    Day5 = "day5"
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





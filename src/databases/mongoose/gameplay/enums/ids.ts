import { registerEnumType } from "@nestjs/graphql"
import { createFirstCharLowerCaseEnumType } from "./utils"

// Animal Enum
export enum AnimalId {
    Chicken = "chicken",
    Cow = "cow",
    Pig = "pig",
    Sheep = "sheep"
}

export const FirstCharLowerCaseAnimalId = createFirstCharLowerCaseEnumType(AnimalId)

registerEnumType(FirstCharLowerCaseAnimalId, {
    name: "AnimalId",
    description: "The animal id.",
    valuesMap: {
        chicken: {
            description: "The chicken id.",
        },
        cow: {
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

export const FirstCharLowerCaseBuildingId = createFirstCharLowerCaseEnumType(BuildingId)

registerEnumType(FirstCharLowerCaseBuildingId, {
    name: "BuildingId",
    description: "The building id.",
    valuesMap: {
        coop: {
            description: "The coop id.",
        },
        barn: {
            description: "The barn id.",
        },
        home: {
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

export const FirstCharLowerCaseCropId = createFirstCharLowerCaseEnumType(CropId)

registerEnumType(FirstCharLowerCaseCropId, {
    name: "CropId",
    description: "The crop id.",
    valuesMap: {
        turnip: {
            description: "The turnip id.",
        },
        carrot: {
            description: "The carrot id.",
        },
        potato: {
            description: "The potato id.",
        },
        pineapple: {
            description: "The pineapple id.",
        },
        watermelon: {
            description: "The watermelon id.",
        },
        cucumber: {
            description: "The cucumber id.",
        },
        bellPepper: {
            description: "The bell pepper id.",
        },
    },
})

// Fruit Enum
export enum FruitId {
    Banana = "banana",
    Apple = "apple",
}

export const FirstCharLowerCaseFruitId = createFirstCharLowerCaseEnumType(FruitId)    

registerEnumType(FirstCharLowerCaseFruitId, {
    name: "FruitId",
    description: "The fruit id.",
    valuesMap: {
        banana: {
            description: "The banana id.",
        },
        apple: {
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

export const FirstCharLowerCaseSupplyId = createFirstCharLowerCaseEnumType(SupplyId)

registerEnumType(FirstCharLowerCaseSupplyId, {
    name: "SupplyId",
    description: "The supply id.",
    valuesMap: {
        basicFertilizer: {
            description: "The basic fertilizer id.",
        },
        animalFeed: {
            description: "The animal feed id.",
        },
        fruitFertilizer: {
            description: "The fruit fertilizer id.",
        },
    },
})

// Tile Enum
export enum TileId {
    BasicTile = "basicTile",
}

export const FirstCharLowerCaseTileId = createFirstCharLowerCaseEnumType(TileId)

registerEnumType(FirstCharLowerCaseTileId, {
    name: "TileId",
    description: "The tile id.",
    valuesMap: {
        basicTile: {
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

export const FirstCharLowerCaseToolId = createFirstCharLowerCaseEnumType(ToolId)  

registerEnumType(FirstCharLowerCaseToolId, {
    name: "ToolId",
    description: "The tool id.",
    valuesMap: {
        hand: {
            description: "The hand id.",
        },
        crate: {
            description: "The crate id.",
        },
        thiefHand: {
            description: "The thief hand id.",
        },
        wateringCan: {
            description: "The watering can id.",
        },
        herbicide: {
            description: "The herbicide id.",
        },
        pesticide: {
            description: "The pesticide id.",
        },
        hammer: {
            description: "The hammer id.",
        },
        animalMedicine: {
            description: "The animal medicine id.",
        },
        bugNet: {
            description: "The bug net id.",
        },
    },
})

// Pet Enum
export enum PetId {
    Dog = "dog",
    Cat = "cat",
}

export const FirstCharLowerCasePetId = createFirstCharLowerCaseEnumType(PetId)

registerEnumType(FirstCharLowerCasePetId, {
    name: "PetId",
    description: "The pet id.",
    valuesMap: {
        dog: {
            description: "The dog id.",
        },
        cat: {
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

export const FirstCharLowerCaseProductId = createFirstCharLowerCaseEnumType(ProductId)    

registerEnumType(FirstCharLowerCaseProductId, {
    name: "ProductId",
    description: "The product id.",
    valuesMap: {
        egg: {
            description: "The egg id.",
        },
        eggQuality: {
            description: "The egg quality id.",
        },
        milk: {
            description: "The milk id.",
        },
        milkQuality: {
            description: "The milk quality id.",
        },
        turnip: {
            description: "The turnip id.",
        },
        turnipQuality: {
            description: "The turnip quality id.",
        },
        carrot: {
            description: "The carrot id.",
        },
        carrotQuality: {
            description: "The carrot quality id.",
        },
        potato: {
            description: "The potato id.",
        },
        potatoQuality: {
            description: "The potato quality id.",
        },
        pineapple: {
            description: "The pineapple id.",
        },
        pineappleQuality: {
            description: "The pineapple quality id.",
        },
        watermelon: {
            description: "The watermelon id.",
        },
        watermelonQuality: {
            description: "The watermelon quality id.",
        },
        cucumber: {
            description: "The cucumber id.",
        },
        cucumberQuality: {
            description: "The cucumber quality id.",
        },
        bellPepper: {
            description: "The bell pepper id.",
        },
        bellPepperQuality: {
            description: "The bell pepper quality id.",
        },
        banana: {
            description: "The banana id.",
        },
        bananaQuality: {
            description: "The banana quality id.",
        },
        apple: {
            description: "The apple id.",
        },
        appleQuality: {
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

export const FirstCharLowerCaseSystemId = createFirstCharLowerCaseEnumType(SystemId)

registerEnumType(FirstCharLowerCaseSystemId, {
    name: "SystemId",
    description: "The system id.",
    valuesMap: {
        activities: {
            description: "The activities id.",
        },
        cropInfo: {
            description: "The crop info id.",
        },
        animalInfo: {
            description: "The animal info id.",
        },
        fruitInfo: {
            description: "The fruit info id.",
        },
        defaultInfo: {
            description: "The default info id.",
        },
        spinInfo: {
            description: "The spin info id.",
        },
        energyRegen: {
            description: "The energy regen id.",
        },
        dailyRewardInfo: {
            description: "The daily reward info id.",
        },
        honeycombInfo: {
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

export const FirstCharLowerCaseKeyValueStoreId = createFirstCharLowerCaseEnumType(KeyValueStoreId)

registerEnumType(FirstCharLowerCaseKeyValueStoreId, {
    name: "KeyValueStoreId",
    description: "The key value store id.",
    valuesMap: {
        cropGrowthLastSchedule: {
            description: "The crop growth last schedule id.",
        },
        animalGrowthLastSchedule: {
            description: "The animal growth last schedule id.",
        },
        energyRegenerationLastSchedule: {
            description: "The energy regeneration last schedule id.",
        },
        fruitGrowthLastSchedule: {
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

export const FirstCharLowerCaseInventoryTypeId = createFirstCharLowerCaseEnumType(InventoryTypeId)

registerEnumType(FirstCharLowerCaseInventoryTypeId, {
    name: "InventoryTypeId",
    description: "The inventory type id.",
    valuesMap: {
        turnipSeed: {
            description: "The turnip seed id.",
        },
        carrotSeed: {
            description: "The carrot seed id.",
        },
        potatoSeed: {
            description: "The potato seed id.",
        },
        pineappleSeed: {
            description: "The pineapple seed id.",
        },
        watermelonSeed: {
            description: "The watermelon seed id.",
        },
        cucumberSeed: {
            description: "The cucumber seed id.",
        },
        bellPepperSeed: {
            description: "The bell pepper seed id.",
        },
        basicFertilizer: {
            description: "The basic fertilizer id.",
        },
        animalFeed: {
            description: "The animal feed id.",
        },
        fruitFertilizer: {
            description: "The fruit fertilizer id.",
        },
        egg: {  
            description: "The egg id.",
        },
        eggQuality: {
            description: "The egg quality id.",
        },
        milk: {
            description: "The milk id.",
        },
        milkQuality: {
            description: "The milk quality id.",
        },
        turnip: {
            description: "The turnip id.",
        },
        turnipQuality: {
            description: "The turnip quality id.",
        },
        carrot: {
            description: "The carrot id.",
        },
        carrotQuality: {
            description: "The carrot quality id.",
        },
        potato: {
            description: "The potato id.",
        },
        potatoQuality: {
            description: "The potato quality id.",
        },
        pineapple: {
            description: "The pineapple id.",
        },
        pineappleQuality: {
            description: "The pineapple quality id.",
        },
        watermelon: {
            description: "The watermelon id.",
        },
        watermelonQuality: {
            description: "The watermelon quality id.",
        },
        cucumber: {
            description: "The cucumber id.",
        },
        cucumberQuality: {
            description: "The cucumber quality id.",
        },
        bellPepper: {
            description: "The bell pepper id.",
        },
        bellPepperQuality: {
            description: "The bell pepper quality id.",
        },
        banana: {
            description: "The banana id.",
        },
        bananaQuality: {
            description: "The banana quality id.",
        },
        apple: {
            description: "The apple id.",
        },
        appleQuality: {
            description: "The apple quality id.",
        },
        hand: {
            description: "The hand id.",
        },
        crate: {
            description: "The crate id.",
        },
        wateringCan: {
            description: "The watering can id.",
        },
        hammer: {
            description: "The hammer id.",
        },
        herbicide: {
            description: "The herbicide id.",
        },
        pesticide: {
            description: "The pesticide id.",
        },
        animalMedicine: {
            description: "The animal medicine id.",
        },
        bugNet: {
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

export const FirstCharLowerCasePlacedItemTypeId = createFirstCharLowerCaseEnumType(PlacedItemTypeId)
    
registerEnumType(FirstCharLowerCasePlacedItemTypeId, {
    name: "PlacedItemTypeId",
    description: "The placed item type id.",
    valuesMap: {
        chicken: {
            description: "The chicken id.",
        },
        cow: {
            description: "The cow id.",
        },
        pig: {
            description: "The pig id.",
        },
        sheep: {
            description: "The sheep id.",
        },
        coop: {
            description: "The coop id.",
        },
        barn: {
            description: "The barn id.",
        },
        home: {
            description: "The home id.",
        },
        basicTile: {
            description: "The basic tile id.",
        },
        apple: {
            description: "The apple id.",
        },  
        banana: {
            description: "The banana id.",
        },
    },
})





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
        [AnimalId.Chicken]: {
            description: "The chicken id.",
        },
        [AnimalId.Cow]: {
            description: "The cow id.",
        },
        [AnimalId.Pig]: {
            description: "The pig id.",
        },
        [AnimalId.Sheep]: {
            description: "The sheep id.",
        },
    },
})

// Building Enum
export enum BuildingId {
    Coop = "coop",
    Barn = "barn",
    Home = "home",
    BeeHouse = "beeHouse",
    PetHouse = "petHouse",
}
 
export const FirstCharLowerCaseBuildingId = createFirstCharLowerCaseEnumType(BuildingId)

registerEnumType(FirstCharLowerCaseBuildingId, {
    name: "BuildingId",
    description: "The building id.",
    valuesMap: {
        [BuildingId.Coop]: {
            description: "The coop id.",
        },
        [BuildingId.Barn]: {
            description: "The barn id.",
        },
        [BuildingId.Home]: {
            description: "The home id.",
        },
        [BuildingId.BeeHouse]: {
            description: "The bee house id.",
        },
        [BuildingId.PetHouse]: {
            description: "The pet house id.",
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
    BellPepper = "bellPepper",
    Strawberry = "strawberry",
}

export const FirstCharLowerCaseCropId = createFirstCharLowerCaseEnumType(CropId)

registerEnumType(FirstCharLowerCaseCropId, {
    name: "CropId",
    description: "The crop id.",
    valuesMap: {
        [CropId.Turnip]: {
            description: "The turnip id.",
        },
        [CropId.Carrot]: {
            description: "The carrot id.",
        },
        [CropId.Potato]: {
            description: "The potato id.",
        },
        [CropId.Pineapple]: {
            description: "The pineapple id.",
        },
        [CropId.Watermelon]: {
            description: "The watermelon id.",
        },
        [CropId.Cucumber]: {
            description: "The cucumber id.",
        },
        [CropId.BellPepper]: {
            description: "The bell pepper id.",
        },
        [CropId.Strawberry]: {
            description: "The strawberry id.",
        },
    },
})

// Flower Enum
export enum FlowerId {
    Daisy = "daisy",
}

export const FirstCharLowerCaseFlowerId = createFirstCharLowerCaseEnumType(FlowerId)

registerEnumType(FirstCharLowerCaseFlowerId, {
    name: "FlowerId",
    description: "The flower id.",
    valuesMap: {
        [FlowerId.Daisy]: {
            description: "The daisy id.",
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
        [FruitId.Banana]: {
            description: "The banana id.",
        },
        [FruitId.Apple]: {
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
        [SupplyId.BasicFertilizer]: {
            description: "The basic fertilizer id.",
        },
        [SupplyId.AnimalFeed]: {
            description: "The animal feed id.",
        },
        [SupplyId.FruitFertilizer]: {
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
        [TileId.BasicTile]: {
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
        [ToolId.Hand]: {
            description: "The hand id.",
        },
        [ToolId.Crate]: {
            description: "The crate id.",
        },
        [ToolId.ThiefHand]: {
            description: "The thief hand id.",
        },
        [ToolId.WateringCan]: {
            description: "The watering can id.",
        },
        [ToolId.Herbicide]: {
            description: "The herbicide id.",
        },
        [ToolId.Pesticide]: {
            description: "The pesticide id.",
        },
        [ToolId.Hammer]: {
            description: "The hammer id.",
        },
        [ToolId.AnimalMedicine]: {
            description: "The animal medicine id.",
        },
        [ToolId.BugNet]: {
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
        [PetId.Dog]: {
            description: "The dog id.",
        },
        [PetId.Cat]: {
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
    Daisy = "daisy",
    DaisyQuality = "daisyQuality",
    Strawberry = "strawberry",
    StrawberryQuality = "strawberryQuality",
    Honey = "honey",
    HoneyQuality = "honeyQuality",
}

export const FirstCharLowerCaseProductId = createFirstCharLowerCaseEnumType(ProductId)    

registerEnumType(FirstCharLowerCaseProductId, {
    name: "ProductId",
    description: "The product id.",
    valuesMap: {
        [ProductId.Egg]: {
            description: "The egg id.",
        },
        [ProductId.EggQuality]: {
            description: "The egg quality id.",
        },
        [ProductId.Milk]: {
            description: "The milk id.",
        },
        [ProductId.MilkQuality]: {
            description: "The milk quality id.",
        },
        [ProductId.Turnip]: {
            description: "The turnip id.",
        },
        [ProductId.TurnipQuality]: {
            description: "The turnip quality id.",
        },
        [ProductId.Carrot]: {
            description: "The carrot id.",
        },
        [ProductId.CarrotQuality]: {
            description: "The carrot quality id.",
        },
        [ProductId.Potato]: {
            description: "The potato id.",
        },
        [ProductId.PotatoQuality]: {
            description: "The potato quality id.",
        },
        [ProductId.Pineapple]: {
            description: "The pineapple id.",
        },
        [ProductId.PineappleQuality]: {
            description: "The pineapple quality id.",
        },
        [ProductId.Watermelon]: {
            description: "The watermelon id.",
        },
        [ProductId.WatermelonQuality]: {
            description: "The watermelon quality id.",
        },
        [ProductId.Cucumber]: {
            description: "The cucumber id.",
        },
        [ProductId.CucumberQuality]: {
            description: "The cucumber quality id.",
        },
        [ProductId.BellPepper]: {
            description: "The bell pepper id.",
        },
        [ProductId.BellPepperQuality]: {
            description: "The bell pepper quality id.",
        },
        [ProductId.Banana]: {
            description: "The banana id.",
        },
        [ProductId.BananaQuality]: {
            description: "The banana quality id.",
        },
        [ProductId.Apple]: {
            description: "The apple id.",
        },
        [ProductId.AppleQuality]: {
            description: "The apple quality id.",
        },
        [ProductId.Daisy]: {
            description: "The daisy id.",
        },
        [ProductId.DaisyQuality]: {
            description: "The daisy quality id.",
        },
        [ProductId.Strawberry]: {
            description: "The strawberry id.",
        },
        [ProductId.StrawberryQuality]: {
            description: "The strawberry quality id.",
        },
    },
})

export enum SystemId {
    Activities = "activities",
    CropInfo = "cropInfo",
    AnimalInfo = "animalInfo",
    FruitInfo = "fruitInfo",
    DefaultInfo = "defaultInfo",
    EnergyRegen = "energyRegen",
    DailyRewardInfo = "dailyRewardInfo",
    HoneycombInfo = "honeycombInfo",
    FlowerInfo = "flowerInfo",
    BeeHouseInfo = "beeHouseInfo",
}

export const FirstCharLowerCaseSystemId = createFirstCharLowerCaseEnumType(SystemId)

registerEnumType(FirstCharLowerCaseSystemId, {
    name: "SystemId",
    description: "The system id.",
    valuesMap: {
        [SystemId.Activities]: {
            description: "The activities id.",
        },
        [SystemId.CropInfo]: {
            description: "The crop info id.",
        },
        [SystemId.AnimalInfo]: {
            description: "The animal info id.",
        },
        [SystemId.FruitInfo]: {
            description: "The fruit info id.",
        },
        [SystemId.DefaultInfo]: {
            description: "The default info id.",
        },
        [SystemId.EnergyRegen]: {
            description: "The energy regen id.",
        },
        [SystemId.DailyRewardInfo]: {
            description: "The daily reward info id.",
        },
        [SystemId.HoneycombInfo]: {
            description: "The honeycomb info id.",
        },
        [SystemId.FlowerInfo]: {
            description: "The flower info id.",
        },
    },
})

export enum KeyValueStoreId {
    AnimalLastSchedule = "animalLastSchedule",
    EnergyRegenerationLastSchedule = "energyRegenerationLastSchedule",
    FruitLastSchedule = "fruitLastSchedule",
    BeeHouseLastSchedule = "beeHouseLastSchedule",
    PlantLastSchedule = "plantLastSchedule",
}

export const FirstCharLowerCaseKeyValueStoreId = createFirstCharLowerCaseEnumType(KeyValueStoreId)

registerEnumType(FirstCharLowerCaseKeyValueStoreId, {
    name: "KeyValueStoreId",
    description: "The key value store id.",
    valuesMap: {
        animalLastSchedule: {
            description: "The animal growth last schedule id.",
        },
        energyRegenerationLastSchedule: {
            description: "The energy regeneration last schedule id.",
        },
        fruitLastSchedule: {
            description: "The fruit last schedule id.",
        },
        beeHouseLastSchedule: {
            description: "The bee house last schedule id.",
        },
        plantLastSchedule: {
            description: "The plant last schedule id.",
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
    DaisySeed = "daisySeed",
    Daisy = "daisy",
    DaisyQuality = "daisyQuality",
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
    StrawberrySeed = "strawberrySeed",
    Strawberry = "strawberry",
    StrawberryQuality = "strawberryQuality",
    Honey = "honey",
    HoneyQuality = "honeyQuality",
}

export const FirstCharLowerCaseInventoryTypeId = createFirstCharLowerCaseEnumType(InventoryTypeId)

registerEnumType(FirstCharLowerCaseInventoryTypeId, {
    name: "InventoryTypeId",
    description: "The inventory type id.",
    valuesMap: {
        [InventoryTypeId.TurnipSeed]: {
            description: "The turnip seed id.",
        },
        [InventoryTypeId.CarrotSeed]: {
            description: "The carrot seed id.",
        },
        [InventoryTypeId.PotatoSeed]: {
            description: "The potato seed id.",
        },
        [InventoryTypeId.PineappleSeed]: {
            description: "The pineapple seed id.",
        },
        [InventoryTypeId.WatermelonSeed]: {
            description: "The watermelon seed id.",
        },
        [InventoryTypeId.CucumberSeed]: {
            description: "The cucumber seed id.",
        },
        [InventoryTypeId.BellPepperSeed]: {
            description: "The bell pepper seed id.",
        },
        [InventoryTypeId.BasicFertilizer]: {
            description: "The basic fertilizer id.",
        },
        [InventoryTypeId.AnimalFeed]: {
            description: "The animal feed id.",
        },
        [InventoryTypeId.FruitFertilizer]: {
            description: "The fruit fertilizer id.",
        },
        [InventoryTypeId.Egg]: {  
            description: "The egg id.",
        },
        [InventoryTypeId.EggQuality]: {
            description: "The egg quality id.",
        },
        [InventoryTypeId.Milk]: {
            description: "The milk id.",
        },
        [InventoryTypeId.MilkQuality]: {
            description: "The milk quality id.",
        },
        [InventoryTypeId.Turnip]: {
            description: "The turnip id.",
        },
        [InventoryTypeId.TurnipQuality]: {
            description: "The turnip quality id.",
        },
        [InventoryTypeId.Carrot]: {
            description: "The carrot id.",
        },
        [InventoryTypeId.CarrotQuality]: {
            description: "The carrot quality id.",
        },
        [InventoryTypeId.Potato]: {
            description: "The potato id.",
        },
        [InventoryTypeId.PotatoQuality]: {
            description: "The potato quality id.",
        },
        [InventoryTypeId.Pineapple]: {
            description: "The pineapple id.",
        },
        [InventoryTypeId.PineappleQuality]: {
            description: "The pineapple quality id.",
        },
        [InventoryTypeId.Watermelon]: {
            description: "The watermelon id.",
        },
        [InventoryTypeId.WatermelonQuality]: {
            description: "The watermelon quality id.",
        },
        [InventoryTypeId.Cucumber]: {
            description: "The cucumber id.",
        },
        [InventoryTypeId.CucumberQuality]: {
            description: "The cucumber quality id.",
        },
        [InventoryTypeId.BellPepper]: {
            description: "The bell pepper id.",
        },
        [InventoryTypeId.BellPepperQuality]: {
            description: "The bell pepper quality id.",
        },
        [InventoryTypeId.Banana]: {
            description: "The banana id.",
        },
        [InventoryTypeId.BananaQuality]: {
            description: "The banana quality id.",
        },
        [InventoryTypeId.Apple]: {
            description: "The apple id.",
        },
        [InventoryTypeId.AppleQuality]: {
            description: "The apple quality id.",
        },
        [InventoryTypeId.Hand]: {
            description: "The hand id.",
        },
        [InventoryTypeId.Crate]: {
            description: "The crate id.",
        },
        [InventoryTypeId.WateringCan]: {
            description: "The watering can id.",
        },
        [InventoryTypeId.Hammer]: {
            description: "The hammer id.",
        },
        [InventoryTypeId.Herbicide]: {
            description: "The herbicide id.",
        },
        [InventoryTypeId.Pesticide]: {
            description: "The pesticide id.",
        },
        [InventoryTypeId.AnimalMedicine]: {
            description: "The animal medicine id.",
        },
        [InventoryTypeId.BugNet]: {
            description: "The bug net id.",
        },
        [InventoryTypeId.StrawberrySeed]: {
            description: "The strawberry seed id.",
        },
        [InventoryTypeId.Strawberry]: {
            description: "The strawberry id.",
        },
        [InventoryTypeId.StrawberryQuality]: {
            description: "The strawberry quality id.",
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
    PetHouse = "petHouse",
    BeeHouse = "beeHouse",
    Home = "home",
    BasicTile = "basicTile",
    Apple = "apple",
    Banana = "banana",
    Dog = "dog",
    Cat = "cat",
}

export const FirstCharLowerCasePlacedItemTypeId = createFirstCharLowerCaseEnumType(PlacedItemTypeId)
    
registerEnumType(FirstCharLowerCasePlacedItemTypeId, {
    name: "PlacedItemTypeId",
    description: "The placed item type id.",
    valuesMap: {
        [PlacedItemTypeId.Chicken]: {
            description: "The chicken id.",
        },
        [PlacedItemTypeId.Cow]: {
            description: "The cow id.",
        },
        [PlacedItemTypeId.Pig]: {
            description: "The pig id.",
        },
        [PlacedItemTypeId.Sheep]: {
            description: "The sheep id.",
        },
        [PlacedItemTypeId.Coop]: {
            description: "The coop id.",
        },
        [PlacedItemTypeId.Barn]: {
            description: "The barn id.",
        },
        [PlacedItemTypeId.PetHouse]: {
            description: "The pet house id.",
        },
        [PlacedItemTypeId.BeeHouse]: {
            description: "The bee house id.",
        },
        [PlacedItemTypeId.Home]: {
            description: "The home id.",
        },
        [PlacedItemTypeId.Apple]: {
            description: "The apple id.",
        },  
        [PlacedItemTypeId.Banana]: {
            description: "The banana id.",
        },
    },
})





import { registerEnumType } from "@nestjs/graphql"
import { createEnumType } from "@src/common"

// Animal Enum
export enum AnimalId {
    Chicken = "chicken",
    Cow = "cow",
    Pig = "pig",
    Sheep = "sheep"
}

export const GraphQLTypeAnimalId = createEnumType(AnimalId)

registerEnumType(GraphQLTypeAnimalId, {
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
    FishPond = "fishPond",
}
 
export const GraphQLTypeBuildingId = createEnumType(BuildingId)

registerEnumType(GraphQLTypeBuildingId, {
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
        [BuildingId.FishPond]: {
            description: "The fish pond id.",
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
    Pumpkin = "pumpkin",
    Cauliflower = "cauliflower",
    Tomato = "tomato",
    Eggplant = "eggplant",
    Pea = "pea",
}

export const GraphQLTypeCropId = createEnumType(CropId)

registerEnumType(GraphQLTypeCropId, {
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
        [CropId.Pumpkin]: {
            description: "The pumpkin id.",
        },
        [CropId.Cauliflower]: {
            description: "The cauliflower id.",
        },
        [CropId.Tomato]: {
            description: "The tomato id.",
        },
        [CropId.Eggplant]: {
            description: "The eggplant id.",
        },
        [CropId.Pea]: {
            description: "The pea id.",
        },
    },
})

// Flower Enum
export enum FlowerId {
    Daisy = "daisy",
    Sunflower = "sunflower",
}

export const GraphQLTypeFlowerId = createEnumType(FlowerId)

registerEnumType(GraphQLTypeFlowerId, {
    name: "FlowerId",
    description: "The flower id.",
    valuesMap: {
        [FlowerId.Daisy]: {
            description: "The daisy id.",
        },
        [FlowerId.Sunflower]: {
            description: "The sunflower id.",
        },
    },
})

// Fruit Enum
export enum FruitId {
    Banana = "banana",
    Apple = "apple",
    DragonFruit = "dragonFruit",
    Jackfruit = "jackfruit",
    Rambutan = "rambutan",
    Pomegranate = "pomegranate",
}

export const GraphQLTypeFruitId = createEnumType(FruitId)    

registerEnumType(GraphQLTypeFruitId, {
    name: "FruitId",
    description: "The fruit id.",
    valuesMap: {
        [FruitId.Banana]: {
            description: "The banana id.",
        },
        [FruitId.Apple]: {
            description: "The apple id.",
        },
        [FruitId.DragonFruit]: {
            description: "The dragon fruit id.",
        },
        [FruitId.Jackfruit]: {
            description: "The jackfruit id.",
        },
        [FruitId.Rambutan]: {
            description: "The rambutan id.",
        },
        [FruitId.Pomegranate]: {
            description: "The pomegranate id.",
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

export const GraphQLTypeSupplyId = createEnumType(SupplyId)

registerEnumType(GraphQLTypeSupplyId, {
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

export const GraphQLTypeTileId = createEnumType(TileId)

registerEnumType(GraphQLTypeTileId, {
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

export const GraphQLTypeToolId = createEnumType(ToolId)  

registerEnumType(GraphQLTypeToolId, {
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

export const GraphQLTypePetId = createEnumType(PetId)

registerEnumType(GraphQLTypePetId, {
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
    DragonFruit = "dragonFruit",
    DragonFruitQuality = "dragonFruitQuality",
    Jackfruit = "jackfruit",
    JackfruitQuality = "jackfruitQuality",
    Rambutan = "rambutan",
    RambutanQuality = "rambutanQuality",    
    Pomegranate = "pomegranate",
    PomegranateQuality = "pomegranateQuality",
    Pumpkin = "pumpkin",
    PumpkinQuality = "pumpkinQuality",
    Cauliflower = "cauliflower",
    CauliflowerQuality = "cauliflowerQuality",
    Tomato = "tomato",
    TomatoQuality = "tomatoQuality",
    Eggplant = "eggplant",
    EggplantQuality = "eggplantQuality",
    Pea = "pea",
    PeaQuality = "peaQuality",
    Sunflower = "sunflower",
    SunflowerQuality = "sunflowerQuality",
    SunflowerSeed = "sunflowerSeed",
    PeaSeed = "peaSeed",
    PumpkinSeed = "pumpkinSeed",
    CauliflowerSeed = "cauliflowerSeed",
    TomatoSeed = "tomatoSeed",
    EggplantSeed = "eggplantSeed",
}

export const GraphQLTypeProductId = createEnumType(ProductId)    

registerEnumType(GraphQLTypeProductId, {
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
        [ProductId.Honey]: {
            description: "The honey id.",
        },
        [ProductId.HoneyQuality]: {
            description: "The honey quality id.",
        },
        [ProductId.DragonFruit]: {
            description: "The dragon fruit id.",
        },
        [ProductId.DragonFruitQuality]: {
            description: "The dragon fruit quality id.",
        },
        [ProductId.Jackfruit]: {
            description: "The jackfruit id.",
        },
        [ProductId.JackfruitQuality]: {
            description: "The jackfruit quality id.",
        },
        [ProductId.Rambutan]: {
            description: "The rambutan id.",
        },
        [ProductId.RambutanQuality]: {
            description: "The rambutan quality id.",
        },
        [ProductId.Pomegranate]: {
            description: "The pomegranate id.",
        },
        [ProductId.PomegranateQuality]: {
            description: "The pomegranate quality id.",
        },
        [ProductId.Pumpkin]: {
            description: "The pumpkin id.",
        },
        [ProductId.PumpkinQuality]: {
            description: "The pumpkin quality id.",
        },
        [ProductId.Cauliflower]: {
            description: "The cauliflower id.",
        },
        [ProductId.CauliflowerQuality]: {
            description: "The cauliflower quality id.",
        },
        [ProductId.Tomato]: {
            description: "The tomato id.",
        },
        [ProductId.TomatoQuality]: {
            description: "The tomato quality id.",
        },
        [ProductId.Eggplant]: {
            description: "The eggplant id.",
        },
        [ProductId.EggplantQuality]: {
            description: "The eggplant quality id.",
        },
        [ProductId.Pea]: {
            description: "The pea id.",
        },
        [ProductId.PeaQuality]: {
            description: "The pea quality id.",
        },
        [ProductId.Sunflower]: {
            description: "The sunflower id.",
        },
        [ProductId.SunflowerQuality]: {
            description: "The sunflower quality id.",
        },
        [ProductId.SunflowerSeed]: {
            description: "The sunflower seed id.",
        },
        [ProductId.PumpkinSeed]: {
            description: "The pumpkin seed id.",
        },
        [ProductId.CauliflowerSeed]: {
            description: "The cauliflower seed id.",
        },
        [ProductId.TomatoSeed]: {
            description: "The tomato seed id.",
        },
        [ProductId.EggplantSeed]: {
            description: "The eggplant seed id.",
        },
        [ProductId.PeaSeed]: {
            description: "The pea seed id.",
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
    NFTCollections = "nftCollections",
    NFTBoxInfo = "nftBoxInfo",
    StableCoins = "stableCoins",
    TokenVaults = "tokenVaults",
    WholesaleMarket = "wholesaleMarket",
    RevenueRecipients = "revenueRecipients",
    GoldPurchases = "goldPurchases",
    InteractionPermissions = "interactionPermissions",
    PetInfo = "petInfo",
    Tokens = "tokens",
    Referral = "referral",
}

export const GraphQLTypeSystemId = createEnumType(SystemId)

registerEnumType(GraphQLTypeSystemId, {
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
        [SystemId.NFTCollections]: {
            description: "The NFT collections id.",
        },
        [SystemId.NFTBoxInfo]: {
            description: "The NFT starter box info id.",
        },
        [SystemId.StableCoins]: {
            description: "The stable coins id.",
        },
        [SystemId.TokenVaults]: {
            description: "The token vaults id.",
        },
        [SystemId.WholesaleMarket]: {
            description: "The wholesale market id.",
        },
        [SystemId.RevenueRecipients]: {
            description: "The revenue recipients id.",
        },
        [SystemId.GoldPurchases]: {
            description: "The gold purchases id.",
        },
        [SystemId.InteractionPermissions]: {
            description: "The interaction permissions id.",
        },
        [SystemId.PetInfo]: {
            description: "The pet info id.",
        },
        [SystemId.Tokens]: {
            description: "Tokens."
        },
        [SystemId.Referral]: {
            description: "The referral id.",
        }
    },
})

export enum KeyValueStoreId {
    AnimalLastSchedule = "animalLastSchedule",
    EnergyRegenerationLastSchedule = "energyRegenerationLastSchedule",
    FruitLastSchedule = "fruitLastSchedule",
    BeeHouseLastSchedule = "beeHouseLastSchedule",
    PlantLastSchedule = "plantLastSchedule",
    VaultInfos = "vaultInfos",
}

export const GraphQLTypeKeyValueStoreId = createEnumType(KeyValueStoreId)

registerEnumType(GraphQLTypeKeyValueStoreId, {
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
        vaultInfos: {
            description: "The vaults info id.",
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
    DragonFruit = "dragonFruit",
    DragonFruitQuality = "dragonFruitQuality",
    Jackfruit = "jackfruit",
    JackfruitQuality = "jackfruitQuality",
    Rambutan = "rambutan",
    RambutanQuality = "rambutanQuality",
    Pomegranate = "pomegranate",
    PomegranateQuality = "pomegranateQuality",
    Pumpkin = "pumpkin",
    PumpkinQuality = "pumpkinQuality",
    Cauliflower = "cauliflower",
    CauliflowerQuality = "cauliflowerQuality",
    Tomato = "tomato",
    TomatoQuality = "tomatoQuality",
    Eggplant = "eggplant",
    EggplantQuality = "eggplantQuality",
    Pea = "pea",
    PeaQuality = "peaQuality",
    Sunflower = "sunflower",
    SunflowerQuality = "sunflowerQuality",
    SunflowerSeed = "sunflowerSeed",
    PeaSeed = "peaSeed",
    PumpkinSeed = "pumpkinSeed",
    CauliflowerSeed = "cauliflowerSeed",
    TomatoSeed = "tomatoSeed",
    EggplantSeed = "eggplantSeed",
}

export const GraphQLTypeInventoryTypeId = createEnumType(InventoryTypeId)

registerEnumType(GraphQLTypeInventoryTypeId, {
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
        [InventoryTypeId.Honey]: {
            description: "The honey id.",
        },
        [InventoryTypeId.HoneyQuality]: {
            description: "The honey quality id.",
        },
        [InventoryTypeId.DragonFruit]: {
            description: "The dragon fruit id.",
        },
        [InventoryTypeId.DragonFruitQuality]: {
            description: "The dragon fruit quality id.",
        },
        [InventoryTypeId.Jackfruit]: {
            description: "The jackfruit id.",
        },
        [InventoryTypeId.JackfruitQuality]: {
            description: "The jackfruit quality id.",
        },
        [InventoryTypeId.Rambutan]: {
            description: "The rambutan id.",
        },
        [InventoryTypeId.RambutanQuality]: {
            description: "The rambutan quality id.",
        },
        [InventoryTypeId.Pomegranate]: {
            description: "The pomegranate id.",
        },
        [InventoryTypeId.PomegranateQuality]: {
            description: "The pomegranate quality id.",
        },
        [InventoryTypeId.Pumpkin]: {
            description: "The pumpkin id.",
        },
        [InventoryTypeId.PumpkinQuality]: {
            description: "The pumpkin quality id.",
        },
        [InventoryTypeId.Cauliflower]: {
            description: "The cauliflower id.",
        },
        [InventoryTypeId.CauliflowerQuality]: {
            description: "The cauliflower quality id.",
        },
        [InventoryTypeId.Tomato]: {
            description: "The tomato id.",
        },
        [InventoryTypeId.TomatoQuality]: {
            description: "The tomato quality id.",
        },
        [InventoryTypeId.Eggplant]: {
            description: "The eggplant id.",
        },
        [InventoryTypeId.EggplantQuality]: {
            description: "The eggplant quality id.",
        },
        [InventoryTypeId.Pea]: {    
            description: "The pea id.",
        },
        [InventoryTypeId.PeaQuality]: {
            description: "The pea quality id.",
        },
        [InventoryTypeId.Sunflower]: {
            description: "The sunflower id.",
        },
        [InventoryTypeId.SunflowerQuality]: {
            description: "The sunflower quality id.",
        },
        [InventoryTypeId.SunflowerSeed]: {
            description: "The sunflower seed id.",
        },
        [InventoryTypeId.PumpkinSeed]: {
            description: "The pumpkin seed id.",
        },
        [InventoryTypeId.CauliflowerSeed]: {
            description: "The cauliflower seed id.",
        },
        [InventoryTypeId.TomatoSeed]: {
            description: "The tomato seed id.",
        },
        [InventoryTypeId.EggplantSeed]: {
            description: "The eggplant seed id.",
        },
        [InventoryTypeId.PeaSeed]: {
            description: "The pea seed id.",
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
    FishPond = "fishPond",
    //ga-cha solana nft
    DragonFruit = "dragonFruit",
    Jackfruit = "jackfruit",
    Rambutan = "rambutan",
    Pomegranate = "pomegranate",
    //
    SmallStone = "smallStone",
    SmallGrassPatch = "smallGrassPatch",
    OakTree = "oakTree",
    PineTree = "pineTree",
    MapleTree = "mapleTree",
}

export const GraphQLTypePlacedItemTypeId = createEnumType(PlacedItemTypeId)
    
registerEnumType(GraphQLTypePlacedItemTypeId, {
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
        [PlacedItemTypeId.Dog]: {
            description: "The dog id.",
        },
        [PlacedItemTypeId.Cat]: {
            description: "The cat id.",
        },
        [PlacedItemTypeId.FishPond]: {
            description: "The fish pond id.",
        },
        [PlacedItemTypeId.SmallStone]: {
            description: "The small stone id.",
        },
        [PlacedItemTypeId.SmallGrassPatch]: {
            description: "The small grass patch id.",
        },
        [PlacedItemTypeId.OakTree]: {
            description: "The oak tree id.",
        },
        [PlacedItemTypeId.PineTree]: {
            description: "The pine tree id.",
        },
        [PlacedItemTypeId.MapleTree]: {
            description: "The maple tree id.",
        },
    },
})

export enum FishId {
    SockeyeSalmon = "sockeyeSalmon",
    Catfish = "catfish",
}

export const GraphQLTypeFishId = createEnumType(FishId)

registerEnumType(GraphQLTypeFishId, {
    name: "FishId",
    description: "The fish id.",
    valuesMap: {
        [FishId.SockeyeSalmon]: {
            description: "The sockeye salmon id.",
        },
        [FishId.Catfish]: {
            description: "The catfish id.",
        },
    },
})

export enum TerrainId {
    SmallStone = "smallStone",
    SmallGrassPatch = "smallGrassPatch",
    OakTree = "oakTree",
    PineTree = "pineTree",
    MapleTree = "mapleTree",
}

export const GraphQLTypeTerrainId = createEnumType(TerrainId)

registerEnumType(GraphQLTypeTerrainId, {
    name: "TerrainId",
    description: "The terrain id.",
    valuesMap: {
        [TerrainId.SmallStone]: {
            description: "The small stone id.",
        },
        [TerrainId.SmallGrassPatch]: {    
            description: "The small grass patch id.",
        },
        [TerrainId.OakTree]: {
            description: "The oak tree id.",
        },
        [TerrainId.PineTree]: {
            description: "The pine tree id.",
        },
        [TerrainId.MapleTree]: {
            description: "The maple tree id.",
        },
    },
})



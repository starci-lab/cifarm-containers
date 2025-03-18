import { registerEnumType } from "@nestjs/graphql"
import { createFirstCharLowerCaseEnumType } from "./utils"

// Product Type Enum
export enum ProductType {
    Animal = "animal",
    Crop = "crop",
    Fruit = "fruit",
}

export const FirstCharLowerCaseProductType = createFirstCharLowerCaseEnumType(ProductType)

registerEnumType(FirstCharLowerCaseProductType, {
    name: "ProductType",
    description: "The type of product",
    valuesMap: {
        animal: {
            description: "The animal product",
        },
        crop: {
            description: "The crop product",
        },
        fruit: {
            description: "The fruit product",
        },
    },
})

// Animal Type Enum
export enum AnimalType {
    Poultry = "poultry",
    Livestock = "livestock"
}

export const FirstCharLowerCaseAnimalType = createFirstCharLowerCaseEnumType(AnimalType)

registerEnumType(FirstCharLowerCaseAnimalType, {
    name: "AnimalType",
    description: "The type of animal",
    valuesMap: {
        poultry: {
            description: "The poultry animal",
        },
        livestock: {
            description: "The livestock animal",
        },
    },
})

// Spin Type Enum
export enum SpinPrizeType {
    Gold = "gold",
    Seed = "seed",
    Supply = "supply",
    Token = "token"
}

export const FirstCharLowerCaseSpinPrizeType = createFirstCharLowerCaseEnumType(SpinPrizeType)

registerEnumType(FirstCharLowerCaseSpinPrizeType, {
    name: "SpinPrizeType",
    description: "The type of spin prize",
    valuesMap: {
        gold: {
            description: "The gold spin prize",
        },
        seed: {
            description: "The seed spin prize",
        },
        supply: {
            description: "The supply spin prize",
        },
        token: {
            description: "The token spin prize",
        },
    },
})

// Inventory Type Enum
export enum InventoryType {
    Seed = "seed",
    Product = "product",
    Supply = "supply",
    Tool = "tool",
}

export const FirstCharLowerCaseInventoryType = createFirstCharLowerCaseEnumType(InventoryType)

registerEnumType(FirstCharLowerCaseInventoryType, {
    name: "InventoryType",
    description: "The type of inventory",
    valuesMap: {
        seed: {
            description: "The seed inventory",
        },
        product: {
            description: "The product inventory",
        },
        supply: {
            description: "The supply inventory",
        },
        tool: {
            description: "The tool inventory",
        },
    },
})

// Placed Item Type Enum
export enum PlacedItemType {
    Tile = "tile",
    Building = "building",
    Animal = "animal",
    Fruit = "fruit",
}

export const FirstCharLowerCasePlacedItemType = createFirstCharLowerCaseEnumType(PlacedItemType)

registerEnumType(FirstCharLowerCasePlacedItemType, {
    name: "PlacedItemType",
    description: "The type of placed item",
    valuesMap: {
        tile: {
            description: "The tile placed item",
        },
        building: {
            description: "The building placed item",
        },
        animal: {
            description: "The animal placed item",
        },
        fruit: {
            description: "The fruit placed item",
        },
    },
})

// AppearanceChance Enum
export enum AppearanceChance {
    Common = "common",
    Uncommon = "uncommon",
    Rare = "rare",
    VeryRare = "veryRare",  
} 

export const FirstCharLowerCaseAppearanceChance = createFirstCharLowerCaseEnumType(AppearanceChance)

registerEnumType(FirstCharLowerCaseAppearanceChance, {
    name: "AppearanceChance",
    description: "The chance of appearance",
    valuesMap: {
        common: {
            description: "The common appearance chance",
        },
        uncommon: {
            description: "The uncommon appearance chance",
        },
        rare: {
            description: "The rare appearance chance",
        },
        veryRare: {
            description: "The very rare appearance chance",
        },
    },
})

// Inventory Kind
export enum InventoryKind {
    Storage = "storage",
    Tool = "tool",
    Delivery = "delivery"
}

export const FirstCharLowerCaseInventoryKind = createFirstCharLowerCaseEnumType(InventoryKind)

registerEnumType(FirstCharLowerCaseInventoryKind, {
    name: "InventoryKind",
    description: "The kind of inventory",
    valuesMap: {
        storage: {
            description: "The storage inventory",
        },
        tool: {
            description: "The tool inventory",
        },
        delivery: {
            description: "The delivery inventory",
        },
    },
})

// Supply Type Enum
export enum SupplyType {
    Fertilizer = "fertilizer",
    AnimalFeed = "animalFeed",
    FruitFertilizer = "fruitFertilizer",
}

export const FirstCharLowerCaseSupplyType = createFirstCharLowerCaseEnumType(SupplyType)

registerEnumType(FirstCharLowerCaseSupplyType, {
    name: "SupplyType",
    description: "The type of supply",
    valuesMap: {
        fertilizer: {
            description: "The fertilizer supply",
        },
        animalFeed: {
            description: "The animal feed supply",
        },
        fruitFertilizer: {
            description: "The fruit fertilizer supply",
        },
    },
})
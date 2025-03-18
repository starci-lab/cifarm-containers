import { registerEnumType } from "@nestjs/graphql"
import { createLowerCaseEnumType } from "./utils"

// Product Type Enum
export enum ProductType {
    Animal = "animal",
    Crop = "crop",
    Fruit = "fruit",
}

export const LowerCaseProductType = createLowerCaseEnumType(ProductType)

registerEnumType(LowerCaseProductType, {
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

export const LowerCaseAnimalType = createLowerCaseEnumType(AnimalType)

registerEnumType(LowerCaseAnimalType, {
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

export const LowerCaseSpinPrizeType = createLowerCaseEnumType(SpinPrizeType)

registerEnumType(LowerCaseSpinPrizeType, {
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

export const LowerCaseInventoryType = createLowerCaseEnumType(InventoryType)

registerEnumType(LowerCaseInventoryType, {
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

export const LowerCasePlacedItemType = createLowerCaseEnumType(PlacedItemType)

registerEnumType(LowerCasePlacedItemType, {
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

export const LowerCaseAppearanceChance = createLowerCaseEnumType(AppearanceChance)

registerEnumType(LowerCaseAppearanceChance, {
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

export const LowerCaseInventoryKind = createLowerCaseEnumType(InventoryKind)

registerEnumType(LowerCaseInventoryKind, {
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

export const LowerCaseSupplyType = createLowerCaseEnumType(SupplyType)

registerEnumType(LowerCaseSupplyType, {
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
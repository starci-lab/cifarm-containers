import { registerEnumType } from "@nestjs/graphql"
import { createFirstCharLowerCaseEnumType } from "./utils"

// Product Type Enum
export enum ProductType {
    Animal = "animal",
    Crop = "crop",
    Fruit = "fruit",
    Flower = "flower",
    Honey = "honey",
}

export const FirstCharLowerCaseProductType = createFirstCharLowerCaseEnumType(ProductType)

registerEnumType(FirstCharLowerCaseProductType, {
    name: "ProductType",
    description: "The type of product",
    valuesMap: {
        [ProductType.Animal]: {
            description: "The animal product",
        },
        [ProductType.Crop]: {
            description: "The crop product",
        },
        [ProductType.Fruit]: {
            description: "The fruit product",
        },
        [ProductType.Flower]: {
            description: "The flower product",
        },
        [ProductType.Honey]: {
            description: "The honey product",
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
        [AnimalType.Poultry]: {
            description: "The poultry animal",
        },
        [AnimalType.Livestock]: {
            description: "The livestock animal",
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
        [InventoryType.Seed]: {
            description: "The seed inventory",
        },
        [InventoryType.Product]: {
            description: "The product inventory",
        },
        [InventoryType.Supply]: {
            description: "The supply inventory",
        },
        [InventoryType.Tool]: {
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
        [PlacedItemType.Tile]: {
            description: "The tile placed item",
        },
        [PlacedItemType.Building]: {
            description: "The building placed item",
        },
        [PlacedItemType.Animal]: {
            description: "The animal placed item",
        },
        [PlacedItemType.Fruit]: {
            description: "The fruit placed item",
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
        [InventoryKind.Storage]: {
            description: "The storage inventory",
        },
        [InventoryKind.Tool]: {
            description: "The tool inventory",
        },
        [InventoryKind.Delivery]: {
            description: "The delivery inventory",
        },
    },
})

// Building Kind
export enum BuildingKind {
    // neutral mean normal building, no special function
    Neutral = "neutral",
    // bee house mean building that can produce honey
    BeeHouse = "beeHouse",
}

export const FirstCharLowerCaseBuildingKind = createFirstCharLowerCaseEnumType(BuildingKind)

registerEnumType(FirstCharLowerCaseBuildingKind, {
    name: "BuildingKind",
    description: "The kind of building",
    valuesMap: {
        [BuildingKind.Neutral]: {
            description: "The neutral building",
        },
        [BuildingKind.BeeHouse]: {
            description: "The bee house building",
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
        [SupplyType.Fertilizer]: {
            description: "The fertilizer supply",
        },
        [SupplyType.AnimalFeed]: {
            description: "The animal feed supply",
        },
        [SupplyType.FruitFertilizer]: {
            description: "The fruit fertilizer supply",
        },
    },
})

// Plant Type Enum
export enum PlantType {
    Crop = "crop",
    Flower = "flower"
}

export const FirstCharLowerCasePlantType = createFirstCharLowerCaseEnumType(PlantType)

registerEnumType(FirstCharLowerCasePlantType, {
    name: "PlantType",
    description: "The type of plant",
    valuesMap: {
        crop: {
            description: "The crop plant",
        },
        flower: {
            description: "The flower plant",
        },
    },
})


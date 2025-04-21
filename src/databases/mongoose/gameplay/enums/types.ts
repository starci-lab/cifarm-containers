import { registerEnumType } from "@nestjs/graphql"
import { createFirstCharLowerCaseEnumType } from "@src/common"
import { PlacedItemTypeId } from "./ids"

// Product Type Enum
export enum ProductType {
    Animal = "animal",
    Crop = "crop",
    Fruit = "fruit",
    Flower = "flower",
    BeeHouse = "beeHouse",
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
        [ProductType.BeeHouse]: {
            description: "The bee house product",
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
    Pet = "pet",
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
        [PlacedItemType.Pet]: {
            description: "The pet placed item",
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
    // pet house mean building that can work with pets
    PetHouse = "petHouse",
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
        [BuildingKind.PetHouse]: {
            description: "The pet house building",
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

// Pet Type Enum
export enum PetType {
    Cat = "cat",
    Dog = "dog"
}   

export const FirstCharLowerCasePetType = createFirstCharLowerCaseEnumType(PetType)

registerEnumType(FirstCharLowerCasePetType, {
    name: "PetType",
    description: "The type of pet",
    valuesMap: {
        [PetType.Cat]: {
            description: "The cat pet",
        },
        [PetType.Dog]: {
            description: "The dog pet",
        },
    },
})

export enum NFTType {
    DragonFruit = "dragonFruit",
    Jackfruit = "jackfruit",
    Rambutan = "rambutan",
    Pomegranate = "pomegranate",
}

export const FirstCharLowerCaseNFTType = createFirstCharLowerCaseEnumType(NFTType)

registerEnumType(FirstCharLowerCaseNFTType, {
    name: "NFTType",
    description: "The type of NFT",
    valuesMap: {
        [NFTType.DragonFruit]: {
            description: "The dragon fruit NFT",
        },
        [NFTType.Jackfruit]: {
            description: "The jackfruit NFT",
        },
        [NFTType.Rambutan]: {
            description: "The rambutan NFT",
        },
        [NFTType.Pomegranate]: {
            description: "The pomegranate NFT",
        },
    },
})

export const NFTTypeToPlacedItemTypeId: Record<NFTType, PlacedItemTypeId> = {
    [NFTType.DragonFruit]: PlacedItemTypeId.DragonFruit,
    [NFTType.Jackfruit]: PlacedItemTypeId.Jackfruit,
    [NFTType.Rambutan]: PlacedItemTypeId.Rambutan,
    [NFTType.Pomegranate]: PlacedItemTypeId.Pomegranate,
}   

export enum NFTRarity {
    Common = "common",
    Rare = "rare",
    Epic = "epic",
}

export const FirstCharLowerCaseNFTRarity = createFirstCharLowerCaseEnumType(NFTRarity)

registerEnumType(FirstCharLowerCaseNFTRarity, {
    name: "NFTRarity",
    description: "The rarity of NFT",
    valuesMap: {
        [NFTRarity.Common]: {
            description: "The common rarity",
        },
        [NFTRarity.Rare]: {
            description: "The rare rarity",
        },
        [NFTRarity.Epic]: {
            description: "The epic rarity",
        },
    },
})

// Stable Coin Name Enum
export enum StableCoinName {
    USDC = "usdc",
    USDT = "usdt",
}


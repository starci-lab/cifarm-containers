import { registerEnumType } from "@nestjs/graphql"
import { createEnumType } from "@src/common"
import { PlacedItemTypeId } from "./ids"

// Product Type Enum
export enum ProductType {
    Animal = "animal",
    Crop = "crop",
    Fruit = "fruit",
    Flower = "flower",
    BeeHouse = "beeHouse"
}

export const GraphQLTypeProductType = createEnumType(ProductType)

registerEnumType(GraphQLTypeProductType, {
    name: "ProductType",
    description: "The type of product",
    valuesMap: {
        [ProductType.Animal]: {
            description: "The animal product"
        },
        [ProductType.Crop]: {
            description: "The crop product"
        },
        [ProductType.Fruit]: {
            description: "The fruit product"
        },
        [ProductType.Flower]: {
            description: "The flower product"
        },
        [ProductType.BeeHouse]: {
            description: "The bee house product"
        }
    }
})

// Animal Type Enum
export enum AnimalType {
    Poultry = "poultry",
    Livestock = "livestock"
}

export const GraphQLTypeAnimalType = createEnumType(AnimalType)

registerEnumType(GraphQLTypeAnimalType, {
    name: "AnimalType",
    description: "The type of animal",
    valuesMap: {
        [AnimalType.Poultry]: {
            description: "The poultry animal"
        },
        [AnimalType.Livestock]: {
            description: "The livestock animal"
        }
    }
})

// Inventory Type Enum
export enum InventoryType {
    Seed = "seed",
    Product = "product",
    Supply = "supply",
    Tool = "tool"
}

export const GraphQLTypeInventoryType = createEnumType(InventoryType)

registerEnumType(GraphQLTypeInventoryType, {
    name: "InventoryType",
    description: "The type of inventory",
    valuesMap: {
        [InventoryType.Seed]: {
            description: "The seed inventory"
        },
        [InventoryType.Product]: {
            description: "The product inventory"
        },
        [InventoryType.Supply]: {
            description: "The supply inventory"
        },
        [InventoryType.Tool]: {
            description: "The tool inventory"
        }
    }
})

// Placed Item Type Enum
export enum PlacedItemType {
    Tile = "tile",
    Building = "building",
    Animal = "animal",
    Fruit = "fruit",
    Pet = "pet",
    Terrain = "terrain"
}

export const GraphQLTypePlacedItemType = createEnumType(PlacedItemType)

registerEnumType(GraphQLTypePlacedItemType, {
    name: "PlacedItemType",
    description: "The type of placed item",
    valuesMap: {
        [PlacedItemType.Tile]: {
            description: "The tile placed item"
        },
        [PlacedItemType.Building]: {
            description: "The building placed item"
        },
        [PlacedItemType.Animal]: {
            description: "The animal placed item"
        },
        [PlacedItemType.Fruit]: {
            description: "The fruit placed item"
        },
        [PlacedItemType.Pet]: {
            description: "The pet placed item"
        },
        [PlacedItemType.Terrain]: {
            description: "The terrain placed item"
        }
    }
})

// Inventory Kind
export enum InventoryKind {
    Storage = "storage",
    Tool = "tool",
    Delivery = "delivery",
    WholesaleMarket = "wholesaleMarket"
}

export const GraphQLTypeInventoryKind = createEnumType(InventoryKind)

registerEnumType(GraphQLTypeInventoryKind, {
    name: "InventoryKind",
    description: "The kind of inventory",
    valuesMap: {
        [InventoryKind.Storage]: {
            description: "The storage inventory"
        },
        [InventoryKind.Tool]: {
            description: "The tool inventory"
        },
        [InventoryKind.Delivery]: {
            description: "The delivery inventory"
        },
        [InventoryKind.WholesaleMarket]: {
            description: "The wholesale market inventory"
        }
    }
})

// Building Kind
export enum BuildingKind {
    // neutral mean normal building, no special function
    Neutral = "neutral",
    // bee house mean building that can produce honey
    BeeHouse = "beeHouse",
    // pet house mean building that can work with pets
    PetHouse = "petHouse",
    // animal house mean building that can work with animals
    AnimalHouse = "animalHouse",
    // fish pond mean building that can work with fish
    FishPond = "fishPond"
}

export const GraphQLTypeBuildingKind = createEnumType(BuildingKind)

registerEnumType(GraphQLTypeBuildingKind, {
    name: "BuildingKind",
    description: "The kind of building",
    valuesMap: {
        [BuildingKind.Neutral]: {
            description: "The neutral building"
        },
        [BuildingKind.BeeHouse]: {
            description: "The bee house building"
        },
        [BuildingKind.PetHouse]: {
            description: "The pet house building"
        },
        [BuildingKind.AnimalHouse]: {
            description: "The animal house building"
        },
        [BuildingKind.FishPond]: {
            description: "The fish pond building"
        }
    }
})

// Supply Type Enum
export enum SupplyType {
    Fertilizer = "fertilizer",
    AnimalFeed = "animalFeed",
    FruitFertilizer = "fruitFertilizer"
}

export const GraphQLTypeSupplyType = createEnumType(SupplyType)

registerEnumType(GraphQLTypeSupplyType, {
    name: "SupplyType",
    description: "The type of supply",
    valuesMap: {
        [SupplyType.Fertilizer]: {
            description: "The fertilizer supply"
        },
        [SupplyType.AnimalFeed]: {
            description: "The animal feed supply"
        },
        [SupplyType.FruitFertilizer]: {
            description: "The fruit fertilizer supply"
        }
    }
})

// Plant Type Enum
export enum PlantType {
    Crop = "crop",
    Flower = "flower"
}

export const GraphQLTypePlantType = createEnumType(PlantType)

registerEnumType(GraphQLTypePlantType, {
    name: "PlantType",
    description: "The type of plant",
    valuesMap: {
        crop: {
            description: "The crop plant"
        },
        flower: {
            description: "The flower plant"
        }
    }
})

// Pet Type Enum
export enum PetType {
    Cat = "cat",
    Dog = "dog"
}

export const GraphQLTypePetType = createEnumType(PetType)

registerEnumType(GraphQLTypePetType, {
    name: "PetType",
    description: "The type of pet",
    valuesMap: {
        [PetType.Cat]: {
            description: "The cat pet"
        },
        [PetType.Dog]: {
            description: "The dog pet"
        }
    }
})

export enum NFTCollectionKey {
    DragonFruit = "dragonFruit",
    Jackfruit = "jackfruit",
    Rambutan = "rambutan",
    Pomegranate = "pomegranate"
}

export const GraphQLTypeNFTCollectionKey = createEnumType(NFTCollectionKey)

registerEnumType(GraphQLTypeNFTCollectionKey, {
    name: "NFTCollectionKey",
    description: "The type of NFT",
    valuesMap: {
        [NFTCollectionKey.DragonFruit]: {
            description: "The dragon fruit NFT"
        },
        [NFTCollectionKey.Jackfruit]: {
            description: "The jackfruit NFT"
        },
        [NFTCollectionKey.Rambutan]: {
            description: "The rambutan NFT"
        },
        [NFTCollectionKey.Pomegranate]: {
            description: "The pomegranate NFT"
        }
    }
})

export const NFTCollectionKeyToPlacedItemTypeId: Record<NFTCollectionKey, PlacedItemTypeId> = {
    [NFTCollectionKey.DragonFruit]: PlacedItemTypeId.DragonFruit,
    [NFTCollectionKey.Jackfruit]: PlacedItemTypeId.Jackfruit,
    [NFTCollectionKey.Rambutan]: PlacedItemTypeId.Rambutan,
    [NFTCollectionKey.Pomegranate]: PlacedItemTypeId.Pomegranate
}

export const placedItemTypeIdToNFTCollectionKey: Partial<Record<PlacedItemTypeId, NFTCollectionKey>> = Object.entries(
    NFTCollectionKeyToPlacedItemTypeId
).reduce(
    (acc, [key, value]) => {
        acc[value] = key as NFTCollectionKey
        return acc
    },
    {} as Partial<Record<PlacedItemTypeId, NFTCollectionKey>>
)

export enum NFTRarity {
    Common = "common",
    Rare = "rare",
    Epic = "epic"
}

export const GraphQLTypeNFTRarity = createEnumType(NFTRarity)

registerEnumType(GraphQLTypeNFTRarity, {
    name: "NFTRarity",
    description: "The rarity of NFT",
    valuesMap: {
        [NFTRarity.Common]: {
            description: "The common rarity"
        },
        [NFTRarity.Rare]: {
            description: "The rare rarity"
        },
        [NFTRarity.Epic]: {
            description: "The epic rarity"
        }
    }
})

export enum OauthProviderName {
    Google = "google",
    Facebook = "facebook",
    X = "x"
}

export const GraphQLTypeOauthProviderName = createEnumType(OauthProviderName)

registerEnumType(GraphQLTypeOauthProviderName, {
    name: "OauthProviderName",
    description: "The name of the oauth provider",
    valuesMap: {
        [OauthProviderName.Google]: {
            description: "The google oauth provider"
        },
        [OauthProviderName.Facebook]: {
            description: "The facebook oauth provider"
        },
        [OauthProviderName.X]: {
            description: "The x oauth provider"
        }
    }
})

export enum TokenType {
    Native = "native",
    Standard = "standard"
}

export const GraphQLTypeTokenType = createEnumType(TokenType)

registerEnumType(GraphQLTypeTokenType, {
    name: "TokenType",
    description: "The type of token",
    valuesMap: {
        [TokenType.Native]: {
            description: "The native token"
        },
        [TokenType.Standard]: {
            description: "The standard token"
        }
    }
})

export enum TokenKey {
    Native = "native",
    USDC = "usdc",
    USDT = "usdt",
    CIFARM = "cifarm",
}

export const GraphQLTypeTokenKey = createEnumType(TokenKey)

registerEnumType(GraphQLTypeTokenKey, {
    name: "TokenKey",
    description: "The key of the token",
    valuesMap: {
        [TokenKey.Native]: {
            description: "The native token"
        },
        [TokenKey.USDC]: {
            description: "The USDC token"
        },
        [TokenKey.USDT]: {
            description: "The USDT token"
        },
        [TokenKey.CIFARM]: {
            description: "The CIFARM token"
        }
    }
})  

export enum TerrainType {
    Stone = "stone",
    GrassPatch = "grassPatch",
    OakTree = "oakTree",
    PineTree = "pineTree",
    MapleTree = "mapleTree",
}

export const GraphQLTypeTerrainType = createEnumType(TerrainType)

registerEnumType(GraphQLTypeTerrainType, {
    name: "TerrainType",
    description: "The type of terrain",
    valuesMap: {
        [TerrainType.Stone]: {
            description: "The stone terrain"
        },
        [TerrainType.GrassPatch]: {
            description: "The grass patch terrain"
        },
        [TerrainType.OakTree]: {
            description: "The oak tree terrain"
        },
        [TerrainType.PineTree]: {
            description: "The pine tree terrain"
        },
        [TerrainType.MapleTree]: {
            description: "The maple tree terrain"
        }
    }
})

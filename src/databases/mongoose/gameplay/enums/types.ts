import { registerEnumType } from "@nestjs/graphql"

// Product Type Enum
export enum ProductType {
    Animal = "animal",
    Crop = "crop",
    Fruit = "fruit",
}

registerEnumType(ProductType, {
    name: "ProductType",
    description: "The type of product",
    valuesMap: {
        Animal: {
            description: "The animal product",
        },
        Crop: {
            description: "The crop product",
        },
        Fruit: {
            description: "The fruit product",
        },
    },
})

// Animal Type Enum
export enum AnimalType {
    Poultry = "poultry",
    Livestock = "livestock"
}

registerEnumType(AnimalType, {
    name: "AnimalType",
    description: "The type of animal",
    valuesMap: {
        Poultry: {
            description: "The poultry animal",
        },
        Livestock: {
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

registerEnumType(SpinPrizeType, {
    name: "SpinPrizeType",
    description: "The type of spin prize",
    valuesMap: {
        Gold: {
            description: "The gold spin prize",
        },
        Seed: {
            description: "The seed spin prize",
        },
        Supply: {
            description: "The supply spin prize",
        },
        Token: {
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

registerEnumType(InventoryType, {
    name: "InventoryType",
    description: "The type of inventory",
    valuesMap: {
        Seed: {
            description: "The seed inventory",
        },
        Product: {
            description: "The product inventory",
        },
        Supply: {
            description: "The supply inventory",
        },
        Tool: {
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

registerEnumType(PlacedItemType, {
    name: "PlacedItemType",
    description: "The type of placed item",
    valuesMap: {
        Tile: {
            description: "The tile placed item",
        },
        Building: {
            description: "The building placed item",
        },
        Animal: {
            description: "The animal placed item",
        },
        Fruit: {
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

registerEnumType(AppearanceChance, {
    name: "AppearanceChance",
    description: "The chance of appearance",
    valuesMap: {
        Common: {
            description: "The common appearance chance",
        },
        Uncommon: {
            description: "The uncommon appearance chance",
        },
        Rare: {
            description: "The rare appearance chance",
        },
        VeryRare: {
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

registerEnumType(InventoryKind, {
    name: "InventoryKind",
    description: "The kind of inventory",
    valuesMap: {
        Storage: {
            description: "The storage inventory",
        },
        Tool: {
            description: "The tool inventory",
        },
        Delivery: {
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

registerEnumType(SupplyType, {
    name: "SupplyType",
    description: "The type of supply",
    valuesMap: {
        Fertilizer: {
            description: "The fertilizer supply",
        },
        AnimalFeed: {
            description: "The animal feed supply",
        },
        FruitFertilizer: {
            description: "The fruit fertilizer supply",
        },
    },
})
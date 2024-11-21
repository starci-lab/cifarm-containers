import { registerEnumType } from "@nestjs/graphql"

// Product Type Enum
export enum ProductType {
    Animal = "animal",
    Crop = "crop"
}

registerEnumType(ProductType, {
    name: "ProductType"
})

// Animal Type Enum
export enum AnimalType {
    Poultry = "poultry",
    Livestock = "livestock"
}

registerEnumType(AnimalType, {
    name: "AnimalType"
})

// Available In Type Enum
export enum AvailableInType {
    Home = "home",
    Neighbor = "neighbor",
    Both = "both"
}

registerEnumType(AvailableInType, {
    name: "AvailableIn"
})

// Supply Type Enum
export enum SupplyType {
    Fertilizer = "fertilizer",
    AnimalFeed = "animalFeed"
}

registerEnumType(SupplyType, {
    name: "SupplyType"
})

// Spin Type Enum
export enum SpinType {
    Gold = "gold",
    Seed = "seed",
    Supply = "supply",
    Token = "token"
}

registerEnumType(SpinType, {
    name: "SpinType"
})

// Inventory Type Enum
export enum InventoryType {
    Seed = "seed",
    Tile = "tile",
    Animal = "animal",
    Product = "product",
    Supply = "supply"
}

registerEnumType(InventoryType, {
    name: "InventoryType"
})

// Placed Item Type Enum
export enum PlacedItemType {
    Tile = "tile",
    Building = "building",
    Animal = "animal"
}

registerEnumType(PlacedItemType, {
    name: "PlacedItemType"
})

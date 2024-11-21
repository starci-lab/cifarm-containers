import { registerEnumType } from "@nestjs/graphql"

export enum ProductType {
    Animal = "Animal",
    Crop = "Crop"
}
registerEnumType(ProductType, {
    name: "ProductType"
})

export enum AnimalType {
    Poultry = "Poultry",
    Livestock = "Livestock"
}
registerEnumType(AnimalType, {
    name: "AnimalType"
})

export enum AvailableInType {
    Home = "Home",
    Neighbor = "Neighbor",
    Both = "Both"
}
registerEnumType(AvailableInType, {
    name: "AvailableIn"
})

export enum SupplyType {
    Fertilizer = "Fertilizer",
    AnimalFeed = "AnimalFeed"
}
registerEnumType(SupplyType, {
    name: "SupplyType"
})

export enum SpinType {
    Gold = "Gold",
    Seed = "Seed",
    Supply = "Supply",
    Token = "Token"
}
registerEnumType(SpinType, {
    name: "SpinType"
})

export enum InventoryType {
    Seed = "Seed",
    Tile = "Tile",
    Animal = "Animal",
    Product = "Product",
    Supply = "Supply"
}

registerEnumType(InventoryType, {
    name: "InventoryType"
})

export enum PlacedItemType {
    Tile = "Tile",
    Building = "Building",
    Animal = "Animal"
}
registerEnumType(PlacedItemType, {
    name: "PlacedItemType"
})

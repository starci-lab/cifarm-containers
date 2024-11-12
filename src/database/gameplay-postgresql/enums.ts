import { registerEnumType } from "@nestjs/graphql"

export enum MarketPricingType {
    Animal = "Animal",
    Crop = "Crop",
}
registerEnumType(MarketPricingType, {
    name: "MarketPricingType",
})

export enum AnimalType {
    Poultry = "Poultry",
    Livestock = "Livestock",
}
registerEnumType(AnimalType, {
    name: "AnimalType"
})

export enum ToolType {
    Scythe = "Scythe",
    Steal = "Steal",
    WaterCan = "WaterCan",
    Herbicide = "Herbicide",
    Pesticide = "Pesticide",
}
registerEnumType(ToolType, {
    name: "ToolType"
})

export enum AvailableInType {
    Home = "Home",
    Neighbor = "Neighbor",
    Both = "Both",
}
registerEnumType(AvailableInType, {
    name: "AvailableIn",
})

export enum BuildingKeyType {
    Coop = "Coop",
    Pasture = "Pasture",
    Home = "Home",
}
registerEnumType(BuildingKeyType, {
    name: "BuildingKeyType"
})

export enum TileKeyType {
    StarterTile = "StarterTile",
    BasicTile1 = "BasicTile1",
    BasicTile2 = "BasicTile2",
    BasicTile3 = "BasicTile3",
    FertileTile = "FertileTile",
}
registerEnumType(TileKeyType, {
    name: "TileKeyType",
})

export enum SupplyType {
    BasicFertilizer = "BasicFertilizer",
    AnimalFeed = "AnimalFeed",
}
registerEnumType(SupplyType, {
    name: "SupplyType",
})

export enum SpinType {
    Gold = "Gold",
    Seed = "Seed",
    Supply = "Supply",
    Token = "Token",
}
registerEnumType(SpinType, {
    name: "SpinType",
})


export enum InventoryType {
    Seed = "Seed",
    Tile = "Tile",
    Animal = "Animal",
    HarvestedCrop = "HarvestedCrop",
    AnimalProduct = "AnimalProduct",
    Supply = "Supply",
}

registerEnumType(InventoryType, {
    name: "InventoryType",
})

export enum AnimalKey {
    Chicken = "Chicken",
    Cow = "Cow",
    Pig = "Pig",
    Sheep = "Sheep",
}
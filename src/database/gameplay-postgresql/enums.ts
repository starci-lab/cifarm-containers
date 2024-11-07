import { registerEnumType } from "@nestjs/graphql"

export enum MarketPricingType {
    Animal,
    Crop,
}
registerEnumType(MarketPricingType, {
    name: "MarketPricingType",
})

export enum AnimalType {
    Poultry,
    Livestock,
}
registerEnumType(AnimalType, {
    name: "AnimalType",
})

export enum ToolType {
    Scythe,
    Steal,
    WaterCan,
    Herbicide,
    Pesticide,
}

registerEnumType(ToolType, {
    name: "ToolType",
});

export enum AvailableInType {
    Home,
    Neighbor,
    Both,
}

registerEnumType(AvailableInType, {
    name: "AvailableIn",
});


export enum BuildingKeyType {
    Coop,
    Pasture,
    Home,
}

registerEnumType(BuildingKeyType, {
    name: "BuildingKeyType",
});

export enum TileKeyType {
    StarterTile,
    BasicTile1,
    BasicTile2,
    BasicTile3,
    FertileTile,
}

registerEnumType(TileKeyType, {
    name: "TileKeyType",
});

export enum SupplyType {
    BasicFertilizer,
    AnimalFeed,
}

registerEnumType(SupplyType, {
    name: "SupplyType",
});

export enum DayType {
    Day1,
    Day2,
    Day3,
    Day4,
    Day5,
}

registerEnumType(DayType, {
    name: 'DayType',
});
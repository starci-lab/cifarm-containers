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
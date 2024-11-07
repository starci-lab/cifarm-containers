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
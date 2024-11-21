import { registerEnumType } from "@nestjs/graphql"

// Crop Current State Enum
export enum CropCurrentState {
    Normal = "normal",
    NeedWater = "needWater",
    IsWeedy = "isWeedy",
    IsInfested = "isInfested"
}

registerEnumType(CropCurrentState, {
    name: "CropCurrentState"
})

// Animal Current State Enum
export enum AnimalCurrentState {
    Normal = "normal",
    Hungry = "hungry",
    Sick = "sick"
}

registerEnumType(AnimalCurrentState, {
    name: "AnimalCurrentState"
})

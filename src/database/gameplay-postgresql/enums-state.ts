import { registerEnumType } from "@nestjs/graphql"

export enum CropCurrentState {
    Normal = "Normal",
    NeedWater = "NeedWater",
    IsWeedy = "IsWeedy",
    IsInfested = "IsInfested"
}
registerEnumType(CropCurrentState, {
    name: "CropCurrentState"
})

export enum AnimalCurrentState {
    Normal = "Normal",
    Hungry = "Hungry",
    Sick = "Sick"
}

registerEnumType(AnimalCurrentState, {
    name: "AnimalCurrentState"
})

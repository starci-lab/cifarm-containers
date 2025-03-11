export interface EmitActionPayload<TData = undefined> {
    userId: string
    placedItemId: string
    action?: ActionName
    success?: boolean
    data?: TData
    reasonCode?: number
}

export interface ThiefCropData {
    quantity: number
    cropId: string
}

export interface HarvestCropData {
    quantity: number
    cropId: string
}

export type ActionEmittedMessage<TData = undefined> = Omit<EmitActionPayload<TData>, "userId">

export enum ActionName {
    Water = "Water",
    UsePesticide = "UsePesticide",
    UseHerbicide = "UseHerbicide",
    UseFertilizer = "UseFertilizer",
    HarvestCrop = "HarvestCrop",
    PlantSeed = "PlantSeed",
    CureAnimal = "CureAnimal",
    FeedAnimal = "FeedAnimal",
    CollectAnimalProduct = "CollectAnimalProduct",
    HelpCureAnimal = "HelpCureAnimal",
    HelpUseHerbicide = "HelpUseHerbicide",
    HelpUsePesticide = "HelpUsePesticide",
    HelpWater = "HelpWater",
    ThiefAnimalProduct = "ThiefAnimalProduct",
    ThiefCrop = "ThiefCrop",
    BuyTile = "BuyTile",
    BuyAnimal = "BuyAnimal",
    ConstructBuilding = "ConstructBuilding",
    Move = "Move",
    Sell = "Sell",
}

export interface EmitActionHarvestCropData{
    quantity: number
}
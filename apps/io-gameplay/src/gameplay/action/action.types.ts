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

export interface SellData {
    quantity: number
}

export type ActionEmittedMessage<TData = undefined> = Omit<EmitActionPayload<TData>, "userId">

export enum ActionName {
    WaterCrop = "watercrop",
    UsePesticide = "usepesticide",
    UseHerbicide = "useherbicide",
    UseFertilizer = "usefertilizer",
    HarvestCrop = "harvestcrop",
    PlantSeed = "plantseed",
    CureAnimal = "cureanimal",
    FeedAnimal = "feedanimal",
    CollectAnimalProduct = "collectanimalproduct",
    HelpCureAnimal = "helpcureanimal",
    HelpUseHerbicide = "helpuseherbicide",
    HelpUsePesticide = "helpusepesticide",
    HelpWater = "helpwater",
    ThiefAnimalProduct = "thiefanimalproduct",
    ThiefCrop = "thiefcrop",
    BuyTile = "buytile",
    BuyAnimal = "buyanimal",
    BuyBuilding = "buybuilding",
    BuyFruit = "buyfruit",
    Move = "move",
    Sell = "sell",
}

export interface EmitActionHarvestCropData{
    quantity: number
}
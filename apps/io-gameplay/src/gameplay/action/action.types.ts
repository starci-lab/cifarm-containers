import { DeepPartial } from "@src/common"
import { PlacedItemSchema } from "@src/databases"

export interface EmitActionPayload<TData = undefined> {
    userId: string
    placedItem: DeepPartial<PlacedItemSchema>
    action?: ActionName
    success?: boolean
    data?: TData
    reasonCode?: number
}

export interface BuyFruitData {
    price: number
}

export interface BuyBuildingData {
    price: number
}

export interface BuyTileData {
    price: number
}

export interface ThiefPlantData {
    quantity: number
    cropId: string
}

export interface HarvestPlantData {
    quantity: number
    cropId: string
}

export interface HarvestFruitData {
    quantity: number
    productId : string
}

export interface ThiefFruitData {
    quantity: number
    productId: string
}

export interface ThiefAnimalProductData {
    quantity: number
    productId: string
}

export interface SellData {
    quantity: number
}

export interface BuyTileData {
    price: number
}

export interface BuyAnimalData {
    price: number
}

export type ActionEmittedMessage<TData = undefined> = Omit<EmitActionPayload<TData>, "userId">

export enum ActionName {
    WaterCrop = "water_crop",
    UsePesticide = "use_pesticide",
    UseHerbicide = "use_herbicide",
    UseFertilizer = "use_fertilizer",
    HarvestCrop = "harvest_crop",
    PlantSeed = "plant_seed",
    CureAnimal = "cure_animal",
    FeedAnimal = "feed_animal",
    HelpFeedAnimal = "help_feed_animal",
    HarvestAnimal = "harvest_animal",
    HelpCureAnimal = "help_cure_animal",
    HelpUseHerbicide = "help_use_herbicide",
    HelpUsePesticide = "help_use_pesticide",
    HelpWaterCrop = "help_water_crop",
    ThiefAnimalProduct = "thief_animal_product",
    ThiefCrop = "thief_crop",
    BuyTile = "buy_tile",
    BuyAnimal = "buy_animal",
    BuyBuilding = "buy_building",
    BuyFruit = "buy_fruit",
    Move = "move",
    Sell = "sell",
    UseBugNet = "use_bug_net",
    UseFruitFertilizer = "use_fruit_fertilizer",
    HelpUseBugNet = "help_use_bug_net",
    HelpUseFruitFertilizer = "help_use_fruit_fertilizer",
    HarvestFruit = "harvest_fruit",
    ThiefFruit = "thief_fruit",
}

export interface EmitActionHarvestCropData{
    quantity: number
}

export interface PlantSeedData {
    placedItemTileId: string
    cropId: string
}
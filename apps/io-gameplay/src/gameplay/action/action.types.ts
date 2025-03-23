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
    productId: string
}

export interface HarvestPlantData {
    quantity: number
    productId: string
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

export interface HarvestAnimalData {
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
    UseWateringCan = "use_watering_can",
    UsePesticide = "use_pesticide",
    UseHerbicide = "use_herbicide",
    UseFertilizer = "use_fertilizer",
    HarvestPlant = "harvest_plant",
    PlantSeed = "plant_seed",
    UseAnimalMedicine = "use_animal_medicine",
    HelpUseAnimalMedicine = "help_use_animal_medicine",
    UseAnimalFeed = "use_animal_feed",
    HarvestAnimal = "harvest_animal",
    HelpUseHerbicide = "help_use_herbicide",
    HelpUsePesticide = "help_use_pesticide",
    HelpUseWateringCan = "help_use_watering_can",
    ThiefAnimalProduct = "thief_animal_product",
    ThiefPlant = "thief_plant",
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
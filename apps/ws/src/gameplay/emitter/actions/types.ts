import { DeepPartial } from "@src/common"
import { PlacedItemSchema } from "@src/databases"

export interface EmitActionPayload<TData = undefined> {
    userId: string
    placedItem: DeepPartial<PlacedItemSchema>
    action?: ActionName
    success?: boolean
    data?: TData
    error?: string
    dogAssistedSuccess?: boolean
}

export interface ThiefPlantData {
    quantity: number
    productId: string
    catAssistedSuccess?: boolean
}

export enum ThiefFruitReasonCode {
    DogAssisted = "dog_assisted",
}

export interface ThiefAnimalData {
    quantity: number
    productId: string
    catAssistedSuccess?: boolean
}

export enum HelpUseWateringCanReasonCode {
    NotNeedWater = "not_need_water",
}

export enum ThiefAnimalReasonCode {
    DogAssisted = "dog_assisted"
}

export interface HarvestPlantData {
    quantity: number
    productId: string
}

export interface HarvestFruitData {
    quantity: number
    productId : string
}


export interface HarvestBeeHouseData {
    quantity: number
    productId: string
}

export interface ThiefBeeHouseData {
    quantity: number
    productId: string
    catAssistedSuccess?: boolean
}

export enum ThiefBeeHouseReasonCode {
    DogAssisted = "dog_assisted",
}

export interface DeliverProductData {
    inventoryId: string
    quantity: number
    index: number
    productId: string
}

export interface BuyTileData {
    tileId: string
}

export interface BuyAnimalData {
    animalId: string
}

export interface BuyPetData {
    petId: string
}

export interface BuyBuildingData {
    buildingId: string
}

export interface BuyFruitData {
    fruitId: string
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
    ThiefAnimal = "thief_animal",
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
    DeliverProduct = "deliver_product",
    DeliverMoreProduct = "deliver_more_product",
    RetrieveProduct = "retrieve_product",
    UpgradeBuilding = "upgrade_building",
    HarvestBeeHouse = "harvest_bee_house",
    ThiefBeeHouse = "thief_bee_house",
    BuyPet = "buy_pet",
    BuyDecoration = "buy_decoration",
    RemovePlant = "remove_plant",
    SelectDog = "select_dog",
    SelectCat = "select_cat",
    PlaceNFT = "place_nft"
}


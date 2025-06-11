export enum ThiefBeeHouseReasonCode {
    DogAssisted = "dog_assisted",
    QuantityReactMinimum = "quantity_react_minimum",
    NotReadyToHarvest = "not_ready_to_harvest",
}

export interface ThiefBeeHouseData {
    quantity: number
    productId: string
    catAssistedSuccess?: boolean
}
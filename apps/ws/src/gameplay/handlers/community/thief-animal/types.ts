export enum ThiefAnimalReasonCode {
    DogAssisted = "dog_assisted",
    QuantityReactMinimum = "quantity_react_minimum",
    NotReadyToHarvest = "not_ready_to_harvest"
}

export interface ThiefAnimalData {
    quantity: number
    productId: string
    catAssistedSuccess?: boolean
}
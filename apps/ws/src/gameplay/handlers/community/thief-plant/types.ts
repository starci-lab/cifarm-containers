export enum ThiefPlantReasonCode {
    DogAssisted = "dog_assisted",
    NotFullyMatured = "not_fully_matured",
    NotPlanted = "not_planted",
    QuantityReactMinimum = "quantity_react_minimum",
}

export interface ThiefPlantData {
    quantity: number
    productId: string
    catAssistedSuccess?: boolean
}
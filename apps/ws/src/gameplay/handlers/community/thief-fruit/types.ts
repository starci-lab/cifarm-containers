export enum ThiefFruitReasonCode {
    DogAssisted = "dog_assisted",
    NotFullyMatured = "not_fully_matured",
    QuantityReactMinimum = "quantity_react_minimum",
}

export interface ThiefFruitData {
    quantity: number
    productId: string
    catAssistedSuccess?: boolean
}

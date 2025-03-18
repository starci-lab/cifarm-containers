import { registerEnumType } from "@nestjs/graphql"
import { createLowerCaseEnumType } from "./utils"

// Crop Current State Enum
export enum CropCurrentState {
    Normal = "normal",
    NeedWater = "needWater",
    IsWeedy = "isWeedy",
    IsInfested = "isInfested",
    FullyMatured = "fullyMatured"
}

export const LowerCaseCropCurrentState = createLowerCaseEnumType(CropCurrentState)

registerEnumType(LowerCaseCropCurrentState, {
    name: "CropCurrentState",
    description: "The current state of the crop",
    valuesMap: {
        normal: {
            description: "The crop is normal"
        },
        needWater: {
            description: "The crop needs water"
        },
        isWeedy: {
            description: "The crop is weedy"
        },
        isInfested: {
            description: "The crop is infested"
        },
        fullyMatured: {
            description: "The crop is fully matured"
        }
    }
})

// Animal Current State Enum
export enum AnimalCurrentState {
    Normal = "normal",
    Hungry = "hungry",
    Sick = "sick",
    Yield = "yield"
}

export const LowerCaseAnimalCurrentState = createLowerCaseEnumType(AnimalCurrentState)

registerEnumType(LowerCaseAnimalCurrentState, {
    name: "AnimalCurrentState",
    description: "The current state of the animal",
    valuesMap: {
        normal: {
            description: "The animal is normal"
        },
        hungry: {
            description: "The animal is hungry"
        },
        sick: {
            description: "The animal is sick"
        },
        yield: {
            description: "The animal is yielding"
        }
    }
})

// Fruit Current State Enum
export enum FruitCurrentState {
    Normal = "normal",
    NeedFertilizer = "needFertilizer",
    IsInfested = "isInfested",
    FullyMatured = "fullyMatured"
}

export const LowerCaseFruitCurrentState = createLowerCaseEnumType(FruitCurrentState)

registerEnumType(LowerCaseFruitCurrentState, {
    name: "FruitCurrentState",
    description: "The current state of the fruit",
    valuesMap: {
        normal: {
            description: "The fruit is normal"
        },
        needFertilizer: {
            description: "The fruit needs fertilizer"
        },
        isInfested: {
            description: "The fruit is infested"
        },
        FullyMatured: {
            description: "The fruit is fully matured"
        }
    }
})

import { registerEnumType } from "@nestjs/graphql"
import { createFirstCharLowerCaseEnumType } from "./utils"

// Crop Current State Enum
export enum CropCurrentState {
    Normal = "normal",
    NeedWater = "needWater",
    IsWeedy = "isWeedy",
    IsInfested = "isInfested",
    FullyMatured = "fullyMatured"
}

export const FirstCharLowerCaseCropCurrentState = createFirstCharLowerCaseEnumType(CropCurrentState)

registerEnumType(FirstCharLowerCaseCropCurrentState, {
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

export const FirstCharLowerCaseAnimalCurrentState = createFirstCharLowerCaseEnumType(AnimalCurrentState)

registerEnumType(FirstCharLowerCaseAnimalCurrentState, {
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
    HasCaterpillar = "hasCaterpillar",
    FullyMatured = "fullyMatured"
}

export const FirstCharLowerCaseFruitCurrentState = createFirstCharLowerCaseEnumType(FruitCurrentState)

registerEnumType(FirstCharLowerCaseFruitCurrentState, {
    name: "FruitCurrentState",
    description: "The current state of the fruit",
    valuesMap: {
        normal: {
            description: "The fruit is normal"
        },
        needFertilizer: {
            description: "The fruit needs fertilizer"
        },
        hasCaterpillar: {
            description: "The fruit has a caterpillar"
        },
        fullyMatured: {
            description: "The fruit is fully matured"
        }
    }
})

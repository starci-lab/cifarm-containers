import { registerEnumType } from "@nestjs/graphql"
import { createFirstCharLowerCaseEnumType } from "./utils"

// Plant Current State Enum
export enum PlantCurrentState {
    Normal = "normal",
    NeedWater = "needWater",
    IsWeedy = "isWeedy",
    IsInfested = "isInfested",
    FullyMatured = "fullyMatured"
}

export const FirstCharLowerCasePlantCurrentState = createFirstCharLowerCaseEnumType(PlantCurrentState)

registerEnumType(FirstCharLowerCasePlantCurrentState, {
    name: "PlantCurrentState",
    description: "The current state of the plant",
    valuesMap: {
        normal: {
            description: "The plant is normal"
        },
        needWater: {
            description: "The plant needs water"
        },
        isWeedy: {
            description: "The plant is weedy"
        },
        isInfested: {
            description: "The plant is infested"
        },
        fullyMatured: {
            description: "The plant is fully matured"
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


// Fruit Current State Enum
export enum BeeHouseCurrentState {
    Normal = "normal",
    Yield = "yield"
}

export const FirstCharLowerCaseBeeHouseCurrentState = createFirstCharLowerCaseEnumType(BeeHouseCurrentState)

registerEnumType(FirstCharLowerCaseBeeHouseCurrentState, {
    name: "BeeHouseCurrentState",
    description: "The current state of the bee house",
    valuesMap: {    
        normal: {
            description: "The bee house is normal"
        },
        yield: {
            description: "The bee house is yielding"
        }
    }
})
import { registerEnumType } from "@nestjs/graphql"
import { createEnumType } from "@src/common"

// Plant Current State Enum
export enum PlantCurrentState {
    Normal = "normal",
    NeedWater = "needWater",
    IsWeedy = "isWeedy",
    IsInfested = "isInfested",
    FullyMatured = "fullyMatured"
}

export const GraphQLTypePlantCurrentState = createEnumType(PlantCurrentState)

registerEnumType(GraphQLTypePlantCurrentState, {
    name: "PlantCurrentState",
    description: "The current state of the plant",
    valuesMap: {
        [PlantCurrentState.Normal]: {
            description: "The plant is normal"
        },
        [PlantCurrentState.NeedWater]: {
            description: "The plant needs water"
        },
        [PlantCurrentState.IsWeedy]: {
            description: "The plant is weedy"
        },
        [PlantCurrentState.IsInfested]: {
            description: "The plant is infested"
        },
        [PlantCurrentState.FullyMatured]: {
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

export const GraphQLTypeAnimalCurrentState = createEnumType(AnimalCurrentState)

registerEnumType(GraphQLTypeAnimalCurrentState, {
    name: "AnimalCurrentState",
    description: "The current state of the animal",
    valuesMap: {
        [AnimalCurrentState.Normal]: {
            description: "The animal is normal"
        },
        [AnimalCurrentState.Hungry]: {
            description: "The animal is hungry"
        },
        [AnimalCurrentState.Sick]: {
            description: "The animal is sick"
        },
        [AnimalCurrentState.Yield]: {
            description: "The animal is yielding"
        }
    }
})

// Fruit Current State Enum
export enum FruitCurrentState {
    Normal = "normal",
    NeedFertilizer = "needFertilizer",
    IsBuggy = "isBuggy",
    FullyMatured = "fullyMatured"
}

export const GraphQLTypeFruitCurrentState = createEnumType(FruitCurrentState)

registerEnumType(GraphQLTypeFruitCurrentState, {
    name: "FruitCurrentState",
    description: "The current state of the fruit",
    valuesMap: {
        [FruitCurrentState.Normal]: {
            description: "The fruit is normal"
        },
        [FruitCurrentState.NeedFertilizer]: {
            description: "The fruit needs fertilizer"
        },
        [FruitCurrentState.IsBuggy]: {
            description: "The fruit has a caterpillar"
        },
        [FruitCurrentState.FullyMatured]: {
            description: "The fruit is fully matured"
        }
    }
})


// Fruit Current State Enum
export enum BeeHouseCurrentState {
    Normal = "normal",
    Yield = "yield"
}

export const GraphQLTypeBeeHouseCurrentState = createEnumType(BeeHouseCurrentState)

registerEnumType(GraphQLTypeBeeHouseCurrentState, {
    name: "BeeHouseCurrentState",
    description: "The current state of the bee house",
    valuesMap: {    
        [BeeHouseCurrentState.Normal]: {
            description: "The bee house is normal"
        },
        [BeeHouseCurrentState.Yield]: {
            description: "The bee house is yielding"
        }
    }
})
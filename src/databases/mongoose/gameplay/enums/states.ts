import { registerEnumType } from "@nestjs/graphql"

// Crop Current State Enum
export enum CropCurrentState {
    Normal = "normal",
    NeedWater = "needWater",
    IsWeedy = "isWeedy",
    IsInfested = "isInfested",
    FullyMatured = "fullyMatured"
}

registerEnumType(CropCurrentState, {
    name: "CropCurrentState",
    description: "The current state of the crop",
    valuesMap: {
        Normal: {
            description: "The crop is normal"
        },
        NeedWater: {
            description: "The crop needs water"
        },
        IsWeedy: {
            description: "The crop is weedy"
        },
        IsInfested: {
            description: "The crop is infested"
        },
        FullyMatured: {
            description: "The crop is fully matured"
        }
    }
})

export const cropCurrentStateResolver: Record<keyof typeof CropCurrentState, string> = {
    Normal: CropCurrentState.Normal,
    NeedWater: CropCurrentState.NeedWater,
    IsWeedy: CropCurrentState.IsWeedy,
    IsInfested: CropCurrentState.IsInfested,
    FullyMatured: CropCurrentState.FullyMatured
}

// Animal Current State Enum
export enum AnimalCurrentState {
    Normal = "normal",
    Hungry = "hungry",
    Sick = "sick",
    Yield = "yield"
}

registerEnumType(AnimalCurrentState, {
    name: "AnimalCurrentState",
    description: "The current state of the animal",
    valuesMap: {
        Normal: {
            description: "The animal is normal"
        },
        Hungry: {
            description: "The animal is hungry"
        },
        Sick: {
            description: "The animal is sick"
        },
        Yield: {
            description: "The animal is yielding"
        }
    }
})

export const animalCurrentStateResolver: Record<keyof typeof AnimalCurrentState, string> = {
    Normal: AnimalCurrentState.Normal,
    Hungry: AnimalCurrentState.Hungry,
    Sick: AnimalCurrentState.Sick,
    Yield: AnimalCurrentState.Yield
}

// Fruit Current State Enum
export enum FruitCurrentState {
    Normal = "normal",
    NeedFertilizer = "needFertilizer",
    IsInfested = "isInfested",
    FullyMatured = "fullyMatured"
}

registerEnumType(FruitCurrentState, {
    name: "FruitCurrentState",
    description: "The current state of the fruit",
    valuesMap: {
        Normal: {
            description: "The fruit is normal"
        },
        NeedFertilizer: {
            description: "The fruit needs fertilizer"
        },
        IsInfested: {
            description: "The fruit is infested"
        },
        FullyMatured: {
            description: "The fruit is fully matured"
        }
    }
})

export const fruitCurrentStateResolver: Record<keyof typeof FruitCurrentState, string> = {
    Normal: FruitCurrentState.Normal,
    NeedFertilizer: FruitCurrentState.NeedFertilizer,
    IsInfested: FruitCurrentState.IsInfested,
    FullyMatured: FruitCurrentState.FullyMatured
}

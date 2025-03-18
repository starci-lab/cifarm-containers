import { registerEnumType } from "@nestjs/graphql"

export enum TutorialStep {
    StartWelcome = 0,
    StartBuySeeds = 1,
    StartOpenInventory = 2,
    StartPlantSeed = 3,
    StartWaterCropAtStage1 = 4,
    StartWaterCropAtStage2 = 5,
    StartToStage3 = 6,
    StartUsePesticide = 7,
    StartUseHerbicide = 8,
    StartHarvestCrop = 9,
    StartDeliverProduct = 10,
    StartGoodbye = 11
}

registerEnumType(TutorialStep, {
    name: "TutorialStep",
    description: "The step of the tutorial",
    valuesMap: {
        StartWelcome: {
            description: "The welcome step of the tutorial",
        },
        StartBuySeeds: {
            description: "The buy seeds step of the tutorial",
        },
        StartOpenInventory: {
            description: "The open inventory step of the tutorial",
        },
        StartPlantSeed: {
            description: "The plant seed step of the tutorial",
        },
        StartWaterCropAtStage1: {
            description: "The water crop at stage 1 step of the tutorial",
        },
        StartWaterCropAtStage2: {
            description: "The water crop at stage 2 step of the tutorial",
        },
        StartToStage3: {
            description: "The to stage 3 step of the tutorial",
        },
        StartUsePesticide: {
            description: "The use pesticide step of the tutorial",
        },
        StartUseHerbicide: {
            description: "The use herbicide step of the tutorial",
        },
        StartHarvestCrop: {
            description: "The harvest crop step of the tutorial",
        },
        StartDeliverProduct: {
            description: "The deliver product step of the tutorial",
        },
        StartGoodbye: {
            description: "The goodbye step of the tutorial",
        },
    },
})

export const defaultTutorialStep = TutorialStep.StartWelcome
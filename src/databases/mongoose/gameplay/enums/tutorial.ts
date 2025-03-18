import { registerEnumType } from "@nestjs/graphql"
import { createLowerCaseEnumType } from "./utils"

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

export const LowerCaseTutorialStep = createLowerCaseEnumType(TutorialStep)

registerEnumType(LowerCaseTutorialStep, {
    name: "TutorialStep",
    description: "The step of the tutorial",
    valuesMap: {
        startWelcome: {
            description: "The welcome step of the tutorial",
        },
        startBuySeeds: {
            description: "The buy seeds step of the tutorial",
        },
        startOpenInventory: {
            description: "The open inventory step of the tutorial",
        },
        startPlantSeed: {
            description: "The plant seed step of the tutorial",
        },
        startWaterCropAtStage1: {
            description: "The water crop at stage 1 step of the tutorial",
        },
        startWaterCropAtStage2: {
            description: "The water crop at stage 2 step of the tutorial",
        },
        startToStage3: {
            description: "The to stage 3 step of the tutorial",
        },
        startUsePesticide: {
            description: "The use pesticide step of the tutorial",
        },
        startUseHerbicide: {
            description: "The use herbicide step of the tutorial",
        },
        startHarvestCrop: {
            description: "The harvest crop step of the tutorial",
        },
        startDeliverProduct: {
            description: "The deliver product step of the tutorial",
        },
        startGoodbye: {
            description: "The goodbye step of the tutorial",
        },
    },
})

export const defaultTutorialStep = TutorialStep.StartWelcome
export enum TutorialStep {
    StartWelcome = 0,
    StartBuySeed = 1,
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

export const defaultTutorialStep = TutorialStep.StartWelcome
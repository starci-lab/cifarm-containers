import { BaseOptions } from "@src/common"

export type TxModuleOptions = BaseOptions


export enum AttributeName {
    Stars = "stars",
    Rarity = "rarity",
    GrowthAcceleration = "growthAcceleration",
    QualityYield = "qualityYield",
    DiseaseResistance = "diseaseResistance",
    HarvestYieldBonus = "harvestYieldBonus",
    CurrentStage = "currentStage",
    WrapperUserId = "wrapperUserId"
}

export enum AttributeTypeValue {
    Fruit = "fruit"
}
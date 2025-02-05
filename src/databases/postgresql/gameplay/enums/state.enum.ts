// Crop Current State Enum
export enum CropCurrentState {
    Normal = "normal",
    NeedWater = "needWater",
    IsWeedy = "isWeedy",
    IsInfested = "isInfested",
    FullyMatured = "fullyMatured",
}

// Animal Current State Enum
export enum AnimalCurrentState {
    Normal = "normal",
    Hungry = "hungry",
    Sick = "sick",
    Yield = "yield",
}

export enum TutorialState {
    // say hello
    SayHello = "sayHello",
    // buy a seed
    BuySeed = "buySeed",
    // open inventory
    OpenInventory = "openInventory",
    // plant a seed
    PlantSeed = "plantSeed",
    // water the crop in stage 1
    WaterCropAtStage1 = "waterCropAtStage1",
    // water the crop in stage 2
    WaterCropAtStage2 = "waterCropAtStage2",
    // to stage 3
    ToStage3 = "toStage3",
    // use pesticide
    UsePesticide = "usePesticide",
    // use herbicide
    UseHerbicide = "useHerbicide",
    // harvest crop
    HarvestCrop = "harvestCrop",
    // deliver product
    DeliverProduct = "deliverProduct",
    // daily reward
    DailyReward = "dailyReward",
    // lucky spin
    LuckySpin = "luckySpin",
    // check quest
    CheckQuest = "checkQuest",
    // say bye
    SayBye = "sayBye",
}
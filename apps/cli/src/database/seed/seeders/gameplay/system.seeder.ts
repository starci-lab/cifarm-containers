import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    Activities,
    AnimalInfo,
    BeeHouseInfo,
    CropId,
    CropInfo,
    DailyRewardId,
    DailyRewardInfo,
    DefaultInfo,
    EnergyRegen,
    FlowerInfo,
    FruitInfo,
    HoneycombInfo,
    InjectMongoose,
    NFTRarity,
    NFTBoxInfo,
    NFTType,
    SystemId,
    SystemSchema,
    RevenueRecipients,
    GoldPurchases,
    InteractionPermissions,
    PetInfo,
    TokenType,
    Tokens,
    TokenKey,
    PlacedItemTypeId,
    Referral,
    NFTConversion,
    EnergyPurchases
} from "@src/databases"
import { ChainKey, Network } from "@src/env"
import { AttributeName } from "@src/blockchain"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

@Injectable()
export class SystemSeeder implements Seeder {
    private readonly logger = new Logger(SystemSeeder.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) { }

    public async drop(): Promise<void> {
        this.logger.debug("Dropping system...")
        await this.connection.model<SystemSchema>(SystemSchema.name).deleteMany({})
    }

    public async seed(): Promise<void> {
        this.logger.debug("Seeding system...")
        const activities: Activities = {
            plantSeed: {
                energyConsume: 1,
                experiencesGain: 3
            },
            useAnimalMedicine: {
                energyConsume: 1,
                experiencesGain: 3
            },
            harvestAnimal: {
                energyConsume: 1,
            },
            useAnimalFeed: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpUseAnimalMedicine: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpUseAnimalFeed: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpUseHerbicide: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpUsePesticide: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpUseWateringCan: {
                energyConsume: 1,
                experiencesGain: 3
            },
            thiefPlant: {
                energyConsume: 1,
                experiencesGain: 3
            },
            thiefAnimal: {
                energyConsume: 1,
                experiencesGain: 3
            },
            useFertilizer: {
                energyConsume: 1,
                experiencesGain: 3
            },
            useHerbicide: {
                energyConsume: 1,
                experiencesGain: 3
            },
            usePesticide: {
                energyConsume: 1,
                experiencesGain: 3
            },
            useWateringCan: {
                energyConsume: 1,
                experiencesGain: 3
            },
            harvestPlant: {
                energyConsume: 1,
            },
            useFruitFertilizer: {
                energyConsume: 1,
                experiencesGain: 3
            },
            useBugNet: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpUseFruitFertilizer: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpUseBugNet: {
                energyConsume: 1,
                experiencesGain: 3
            },
            harvestFruit: {
                energyConsume: 1,
            },
            thiefFruit: {
                energyConsume: 1,
                experiencesGain: 3
            },
            harvestBeeHouse: {
                energyConsume: 1,
            },
            thiefBeeHouse: {
                energyConsume: 1,
                experiencesGain: 3
            }
        }
        const cropInfo: CropInfo = {
            randomness: {
                needWater: 0.5,
                thief2: 0.8,
                thief3: 0.95,
                isWeedyOrInfested: 1
            },
            nextGrowthStageAfterHarvest: 3,
            growthStages: 5,
            minThievablePercentage: 0.7
        }
        const animalInfo: AnimalInfo = {
            randomness: {
                sickChance: 0.5,
                thief2: 0.8,
                thief3: 0.95
            },
            minThievablePercentage: 0.7
        }
        const flowerInfo: FlowerInfo = {
            randomness: {
                thief2: 0.8,
                thief3: 0.95,
                needWater: 0.5,
                isWeedyOrInfested: 1
            },
            nextGrowthStageAfterHarvest: 3,
            growthStages: 5,
            minThievablePercentage: 0.7
        }
        const fruitInfo: FruitInfo = {
            randomness: {
                thief2: 0.8,
                thief3: 0.95,
                isBuggy: 1,
            },
            nextGrowthStageAfterHarvest: 3,
            growthStages: 5,
            matureGrowthStage: 2,
            minThievablePercentage: 0.7
        }
        const defaultInfo: DefaultInfo = {
            golds: 10000,
            followeeLimit: 150,
            positions: {
                tiles: [
                    // first row
                    {
                        x: -1,
                        y: -1
                    },
                    {
                        x: 0,
                        y: -1
                    },
                    {
                        x: 1,
                        y: -1
                    },
                    // second row
                    {
                        x: -1,
                        y: 0
                    },
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 1,
                        y: 0
                    },
                    // third row
                    {
                        x: -1,
                        y: 1
                    },
                    {
                        x: 0,
                        y: 1
                    },
                    {
                        x: 1,
                        y: 1
                    },
                    // fourth row
                    {
                        x: -1,
                        y: 2
                    },
                    {
                        x: 0,
                        y: 2
                    },
                    {
                        x: 1,
                        y: 2
                    }
                ],
                home: {
                    x: 6,
                    y: 0
                },
                beeHouse: {
                    x: -1,
                    y: -4
                },
                bananaFruits: [
                    {
                        x: 5,
                        y: 3
                    },
                    {
                        x: 7,
                        y: 5
                    },
                ],
                coop: {
                    x: -4,
                    y: -3
                },
                chickens: [
                    {
                        x: -4,
                        y: 1
                    },
                    {
                        x: -3,
                        y: 2
                    },
                ],
                smallStones: [
                    {
                        x: 3,
                        y: 3
                    },
                    {
                        x: -5,
                        y: -4
                    },
                    {
                        x: 2,
                        y: 6
                    },
                    {
                        x: -3,
                        y: -8
                    },
                    {
                        x: 9,
                        y: 4
                    },
                    {
                        x: 5,
                        y: -5
                    },
                    {
                        x: -6,
                        y: -6
                    },
                    {
                        x: 1,
                        y: -5
                    },

                ],
                smallGrassPatches: [
                    {
                        x: -3,
                        y: -2
                    },
                    {
                        x: -2,
                        y: -3
                    },
                    {
                        x: 2,
                        y: 2
                    },
                    {
                        x: 0,
                        y: 4
                    },
                    {
                        x: 9,
                        y: 2
                    },
                    {
                        x: 2,
                        y: 7
                    },
                    {
                        x: -3,
                        y: 4
                    },
                    {
                        x: -7,
                        y: -1
                    },
                ],
                oakTrees: [
                    {
                        x: 8,
                        y: -1
                    },
                    {
                        x: -7,
                        y: -2
                    },
                    {
                        x: 1,
                        y: 7
                    },
                    {
                        x: 0,
                        y: -6
                    },
                ],
                pineTrees: [
                    {
                        x: 9,
                        y: 1
                    },
                    {
                        x: -7,
                        y: -4
                    },
                    {
                        x: 4,
                        y: 6
                    },
                    {
                        x: -4,
                        y: -6
                    },

                ],
                mapleTrees: [
                    {
                        x: 8,
                        y: 3
                    },
                    {
                        x: 7,
                        y: 7
                    },
                    {
                        x: -4,
                        y: 3
                    },
                    {
                        x: 2,
                        y: -6
                    },
                ]
            },
            defaultCropId: CropId.Turnip,
            defaultSeedQuantity: 10,
            storageCapacity: 150,
            deliveryCapacity: 9,
            wholesaleMarketCapacity: 50,
            toolCapacity: 8,
            referredLimit: 25,
            referralRewardQuantity: 4000,
            referredRewardQuantity: 2000,
            followXRewardQuantity: 2000,
            tileLimit: 60,
            fruitLimit: 10,
            buildingLimit: 30
        }
        const energyRegen: EnergyRegen = {
            // 5 minutes
            time: 60 * 5
        }
        const dailyRewardInfo: DailyRewardInfo = {
            [DailyRewardId.Day1]: {
                golds: 100,
                day: 1,
                lastDay: false
            },
            [DailyRewardId.Day2]: {
                golds: 200,
                day: 2,
                lastDay: false
            },
            [DailyRewardId.Day3]: {
                golds: 300,
                day: 3,
                lastDay: false
            },
            [DailyRewardId.Day4]: {
                golds: 600,
                day: 4,
                lastDay: false
            },
            [DailyRewardId.Day5]: {
                day: 5,
                lastDay: true,
                golds: 1000,
            },
        }

        const nftCollections = {
            [NFTType.DragonFruit]: {
                [Network.Testnet]: {
                    placedItemTypeId: createObjectId(PlacedItemTypeId.DragonFruit),
                    name: "Dragon Fruit",
                    collectionAddress: "365jHCcxRigSHZQe99joKnbbFGWhPWsCr3wC7P3jGDmf",
                    imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/dragon-fruit.png",
                    fruitStages: {
                        stages: [
                            { stage: 0, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/dragon_fruit_stage_1.png" },
                            { stage: 1, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/dragon_fruit_stage_2.png" },
                            { stage: 2, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/dragon_fruit_stage_3.png" },
                            { stage: 3, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/dragon_fruit_stage_4.png" },
                            { stage: 4, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/dragon_fruit_stage_5.png" }
                        ]
                    },
                    rarities: {
                        [NFTRarity.Common]: {
                            [AttributeName.GrowthAcceleration]: 100,
                            [AttributeName.QualityYield]: 100,
                            [AttributeName.DiseaseResistance]: 100,
                            [AttributeName.HarvestYieldBonus]: 100
                        },
                        [NFTRarity.Rare]: {
                            [AttributeName.GrowthAcceleration]: 200,
                            [AttributeName.QualityYield]: 200,
                            [AttributeName.DiseaseResistance]: 200,
                            [AttributeName.HarvestYieldBonus]: 200
                        },
                        [NFTRarity.Epic]: {
                            [AttributeName.GrowthAcceleration]: 300,
                            [AttributeName.QualityYield]: 300,
                            [AttributeName.DiseaseResistance]: 300,
                            [AttributeName.HarvestYieldBonus]: 300
                        }
                    }
                },
                [Network.Mainnet]: {
                    placedItemTypeId: createObjectId(PlacedItemTypeId.DragonFruit),
                    name: "Dragon Fruit",
                    collectionAddress: "Bz2d2c3j5prkiTwSaPnJmMvhf2mQGS2LJWci3QD1mYYn",
                    imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/dragon-fruit.png",
                    fruitStages: {
                        stages: [
                            { stage: 0, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/dragon_fruit_stage_1.png" },
                            { stage: 1, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/dragon_fruit_stage_2.png" },
                            { stage: 2, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/dragon_fruit_stage_3.png" },
                            { stage: 3, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/dragon_fruit_stage_4.png" },
                            { stage: 4, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/dragon_fruit_stage_5.png" }
                        ]
                    },
                    rarities: {
                        [NFTRarity.Common]: {
                            [AttributeName.GrowthAcceleration]: 100,
                            [AttributeName.QualityYield]: 100,
                            [AttributeName.DiseaseResistance]: 100,
                            [AttributeName.HarvestYieldBonus]: 100
                        },
                        [NFTRarity.Rare]: {
                            [AttributeName.GrowthAcceleration]: 200,
                            [AttributeName.QualityYield]: 200,
                            [AttributeName.DiseaseResistance]: 200,
                            [AttributeName.HarvestYieldBonus]: 200
                        },
                        [NFTRarity.Epic]: {
                            [AttributeName.GrowthAcceleration]: 300,
                            [AttributeName.QualityYield]: 300,
                            [AttributeName.DiseaseResistance]: 300,
                            [AttributeName.HarvestYieldBonus]: 300
                        }
                    }
                }
            },
            [NFTType.Jackfruit]: {
                [Network.Testnet]: {
                    placedItemTypeId: createObjectId(PlacedItemTypeId.Jackfruit),
                    name: "Jackfruit",
                    collectionAddress: "3Fu3Z6gAFNHcSasFa3XBgDmpyT1JdAGfgy61hsYUqzcu",
                    imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/jackfruit.png",
                    fruitStages: {
                        stages: [
                            { stage: 0, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/jackfruit_stage_1.png" },
                            { stage: 1, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/jackfruit_stage_2.png" },
                            { stage: 2, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/jackfruit_stage_3.png" },
                            { stage: 3, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/jackfruit_stage_4.png" },
                            { stage: 4, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/jackfruit_stage_5.png" }
                        ]
                    },
                    rarities: {
                        [NFTRarity.Common]: {
                            [AttributeName.GrowthAcceleration]: 100,
                            [AttributeName.QualityYield]: 100,
                            [AttributeName.DiseaseResistance]: 100,
                            [AttributeName.HarvestYieldBonus]: 100
                        },
                        [NFTRarity.Rare]: {
                            [AttributeName.GrowthAcceleration]: 200,
                            [AttributeName.QualityYield]: 200,
                            [AttributeName.DiseaseResistance]: 200,
                            [AttributeName.HarvestYieldBonus]: 200
                        },
                        [NFTRarity.Epic]: {
                            [AttributeName.GrowthAcceleration]: 300,
                            [AttributeName.QualityYield]: 300,
                            [AttributeName.DiseaseResistance]: 300,
                            [AttributeName.HarvestYieldBonus]: 300
                        }
                    }
                },
                [Network.Mainnet]: {
                    placedItemTypeId: createObjectId(PlacedItemTypeId.Jackfruit),
                    name: "Jackfruit",
                    collectionAddress: "5fyfT1qh1xq8MUtUG2VTERNwpQE45L8AYvBWcmQfZe3m",
                    imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/jackfruit.png",
                    fruitStages: {
                        stages: [
                            { stage: 0, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/jackfruit_stage_1.png" },
                            { stage: 1, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/jackfruit_stage_2.png" },
                            { stage: 2, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/jackfruit_stage_3.png" },
                            { stage: 3, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/jackfruit_stage_4.png" },
                            { stage: 4, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/jackfruit_stage_5.png" }
                        ]
                    },
                    rarities: {
                        [NFTRarity.Common]: {
                            [AttributeName.GrowthAcceleration]: 100,
                            [AttributeName.QualityYield]: 100,
                            [AttributeName.DiseaseResistance]: 100,
                            [AttributeName.HarvestYieldBonus]: 100
                        },
                        [NFTRarity.Rare]: {
                            [AttributeName.GrowthAcceleration]: 200,
                            [AttributeName.QualityYield]: 200,
                            [AttributeName.DiseaseResistance]: 200,
                            [AttributeName.HarvestYieldBonus]: 200
                        },
                        [NFTRarity.Epic]: {
                            [AttributeName.GrowthAcceleration]: 300,
                            [AttributeName.QualityYield]: 300,
                            [AttributeName.DiseaseResistance]: 300,
                            [AttributeName.HarvestYieldBonus]: 300
                        }
                    }
                }
            },
            [NFTType.Pomegranate]: {
                [Network.Testnet]: {
                    placedItemTypeId: createObjectId(PlacedItemTypeId.Pomegranate),
                    name: "Pomegranate",
                    collectionAddress: "3QHjGDB9Jc812xLT2JmpnKKL3z6Nod6XGarrZVFk2AEV",
                    imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/pomegranate.png",
                    fruitStages: {
                        stages: [
                            { stage: 0, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/pomegranate_stage_1.png" },
                            { stage: 1, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/pomegranate_stage_2.png" },
                            { stage: 2, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/pomegranate_stage_3.png" },
                            { stage: 3, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/pomegranate_stage_4.png" },
                            { stage: 4, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/pomegranate_stage_5.png" }
                        ]
                    },
                    rarities: {
                        [NFTRarity.Common]: {
                            [AttributeName.GrowthAcceleration]: 100,
                            [AttributeName.QualityYield]: 100,
                            [AttributeName.DiseaseResistance]: 100,
                            [AttributeName.HarvestYieldBonus]: 100
                        },
                        [NFTRarity.Rare]: {
                            [AttributeName.GrowthAcceleration]: 200,
                            [AttributeName.QualityYield]: 200,
                            [AttributeName.DiseaseResistance]: 200,
                            [AttributeName.HarvestYieldBonus]: 200
                        },
                        [NFTRarity.Epic]: {
                            [AttributeName.GrowthAcceleration]: 300,
                            [AttributeName.QualityYield]: 300,
                            [AttributeName.DiseaseResistance]: 300,
                            [AttributeName.HarvestYieldBonus]: 300
                        }
                    }
                },
                [Network.Mainnet]: {
                    placedItemTypeId: createObjectId(PlacedItemTypeId.Pomegranate),
                    name: "Pomegranate",
                    collectionAddress: "5Wkwa8TmvQrAnubA9RJfCaJC44QafJbsYgoMfdMu23BA",
                    imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/pomegranate.png",
                    fruitStages: {
                        stages: [
                            { stage: 0, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/pomegranate_stage_1.png" },
                            { stage: 1, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/pomegranate_stage_2.png" },
                            { stage: 2, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/pomegranate_stage_3.png" },
                            { stage: 3, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/pomegranate_stage_4.png" },
                            { stage: 4, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/pomegranate_stage_5.png" }
                        ]
                    },
                    rarities: {
                        [NFTRarity.Common]: {
                            [AttributeName.GrowthAcceleration]: 100,
                            [AttributeName.QualityYield]: 100,
                            [AttributeName.DiseaseResistance]: 100,
                            [AttributeName.HarvestYieldBonus]: 100
                        },
                        [NFTRarity.Rare]: {
                            [AttributeName.GrowthAcceleration]: 200,
                            [AttributeName.QualityYield]: 200,
                            [AttributeName.DiseaseResistance]: 200,
                            [AttributeName.HarvestYieldBonus]: 200
                        },
                        [NFTRarity.Epic]: {
                            [AttributeName.GrowthAcceleration]: 300,
                            [AttributeName.QualityYield]: 300,
                            [AttributeName.DiseaseResistance]: 300,
                            [AttributeName.HarvestYieldBonus]: 300
                        }
                    }
                }
            },
            [NFTType.Rambutan]: {
                [Network.Testnet]: {
                    placedItemTypeId: createObjectId(PlacedItemTypeId.Rambutan),
                    name: "Rambutan",
                    collectionAddress: "2PiEZzrHQEVd3KTsGGrNDiV2vyXuPsNNt3pAFM1huK6s",
                    imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/rambutan_collection.png",
                    fruitStages: {
                        stages: [
                            { stage: 0, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/rambutan_stage_1.png" },
                            { stage: 1, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/rambutan_stage_2.png" },
                            { stage: 2, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/rambutan_stage_3.png" },
                            { stage: 3, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/rambutan_stage_4.png" },
                            { stage: 4, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/rambutan_stage_5.png" }
                        ]
                    },
                    rarities: {
                        [NFTRarity.Common]: {
                            [AttributeName.GrowthAcceleration]: 100,
                            [AttributeName.QualityYield]: 100,
                            [AttributeName.DiseaseResistance]: 100,
                            [AttributeName.HarvestYieldBonus]: 100
                        },
                        [NFTRarity.Rare]: {
                            [AttributeName.GrowthAcceleration]: 200,
                            [AttributeName.QualityYield]: 200,
                            [AttributeName.DiseaseResistance]: 200,
                            [AttributeName.HarvestYieldBonus]: 200
                        },
                        [NFTRarity.Epic]: {
                            [AttributeName.GrowthAcceleration]: 300,
                            [AttributeName.QualityYield]: 300,
                            [AttributeName.DiseaseResistance]: 300,
                            [AttributeName.HarvestYieldBonus]: 300
                        }
                    }
                },
                [Network.Mainnet]: {
                    placedItemTypeId: createObjectId(PlacedItemTypeId.Rambutan),
                    name: "Rambutan",
                    collectionAddress: "ECWpmdiBbAk4JcXnhbrSCnTMia7M8hf4gtfnfD7Q8jM5",
                    imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/rambutan.png",
                    fruitStages: {
                        stages: [
                            { stage: 0, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/rambutan_stage_1.png" },
                            { stage: 1, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/rambutan_stage_2.png" },
                            { stage: 2, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/rambutan_stage_3.png" },
                            { stage: 3, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/rambutan_stage_4.png" },
                            { stage: 4, imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/rambutan_stage_5.png" }
                        ]
                    },
                    rarities: {
                        [NFTRarity.Common]: {
                            [AttributeName.GrowthAcceleration]: 100,
                            [AttributeName.QualityYield]: 100,
                            [AttributeName.DiseaseResistance]: 100,
                            [AttributeName.HarvestYieldBonus]: 100
                        },
                        [NFTRarity.Rare]: {
                            [AttributeName.GrowthAcceleration]: 200,
                            [AttributeName.QualityYield]: 200,
                            [AttributeName.DiseaseResistance]: 200,
                            [AttributeName.HarvestYieldBonus]: 200
                        },
                        [NFTRarity.Epic]: {
                            [AttributeName.GrowthAcceleration]: 300,
                            [AttributeName.QualityYield]: 300,
                            [AttributeName.DiseaseResistance]: 300,
                            [AttributeName.HarvestYieldBonus]: 300
                        }
                    }
                }
            }
        }

        const honeycombInfo: HoneycombInfo = {
            dailyRewardAmount: 10000000, // 10 $CARROT
            tokenResourceAddress: "6JkqdDyrXsySvnvKBmFVpay9L413VXJcd78kFJ2XSABH",
            projectAddress: "BoRbyNqh3YmYzzuFMLZ2kjFEC1whr4zS9wPskqp7uqZL",
            decimals: 6,
            profilesTreeAddresses: ["BTjBVuqM9be9LbSy7USu6VFhZcdmAyWfatNRNCAuqdtu"],
            characterModels: {
                [NFTType.DragonFruit]: {
                    testnet: "AoDvMMjnuBpeQ6mAkiuRsHkrYCogF3iGVMgr95oysezM",
                    mainnet: ""
                }
            }
        }

        const beeHouseInfo: BeeHouseInfo = {
            randomness: {
                thief2: 0.8,
                thief3: 0.95
            },
            minThievablePercentage: 0.7
        }

        const nftBoxInfo: NFTBoxInfo = {
            chances: [
                {
                    nftType: NFTType.Jackfruit,
                    startChance: 0,
                    endChance: 0.3,
                    rareRarityChance: 0.8,
                    epicRarityChance: 0.9
                },
                {
                    nftType: NFTType.Pomegranate,
                    startChance: 0.3,
                    endChance: 0.6,
                    rareRarityChance: 0.8,
                    epicRarityChance: 0.9
                },
                {
                    nftType: NFTType.Rambutan,
                    startChance: 0.6,
                    endChance: 0.9,
                    rareRarityChance: 0.8,
                    epicRarityChance: 0.9
                },
                {
                    nftType: NFTType.DragonFruit,
                    startChance: 0.9,
                    endChance: 1,
                    rareRarityChance: 0.8,
                    epicRarityChance: 0.9
                }
            ],
            tokenKey: TokenKey.USDC,
            boxPrice: 0.5, // 0.5 USDC
            feePercentage: 0.02 // 2% to fee collector, will to the fee collector address
        }

        const revenueRecipients: RevenueRecipients = {
            [Network.Testnet]: {
                address: "D2HHp9gtFgs8dKtV6Hg2xgLv998HrwsyaWAeHkfuCJxJ"
            },
            [Network.Mainnet]: {
                address: "49MYBZq5jVtgM4E5NxeyH17un1qeWCq9jQwo2mrWPAnE"
            }
        }
        
        const goldPurchases: GoldPurchases = {
            [Network.Testnet]: {
                options: [
                    {
                        amount: 10000,
                        price: 1,
                        tokenKey: TokenKey.USDC
                    },
                    {
                        amount: 100000,
                        price: 5,
                        tokenKey: TokenKey.USDC
                    },
                    {
                        amount: 1000000,
                        price: 25,
                        tokenKey: TokenKey.USDC
                    }
                ]
            },
            [Network.Mainnet]: {
                options: [
                    {
                        amount: 10000,
                        price: 1,
                        tokenKey: TokenKey.USDC
                    },
                    {
                        amount: 100000,
                        price: 5,
                        tokenKey: TokenKey.USDC
                    },
                    {
                        amount: 1000000,
                        price: 25,
                        tokenKey: TokenKey.USDC
                    },
                ]
            }
        }

        // you can thief from user who has 3 
        const interactionPermissions: InteractionPermissions = {
            thiefLevelGapThreshold: 3,
        }

        const petInfo: PetInfo = {
            cat: {
                chance: 0.1, // use 10% chance to assist
                plusQuantity: 1, // plus 1 quantity
                percentQuantityBonus: 0.5 // 50% bonus towards quantity
            },
            dog: {
                chance: 0.1, // use 10% chance to assist
                energyReduce: 3 // 3 energy per bite
            }
        }

        const tokens: Tokens = {
            [TokenKey.Native]: {
                [ChainKey.Solana]: {
                    [Network.Testnet]: {
                        tokenType: TokenType.Native,
                        tokenAddress: "native",
                        name: "Solana",
                        symbol: "SOL",
                        decimals: 9,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/solana.svg",
                    },
                    [Network.Mainnet]: {
                        tokenType: TokenType.Native,
                        tokenAddress: "native",
                        name: "Solana",
                        symbol: "SOL",
                        decimals: 9,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/solana.svg",
                    }
                },
                [ChainKey.Sui]: {
                    [Network.Testnet]: {
                        tokenType: TokenType.Native,
                        tokenAddress: "native",
                        name: "Sui",
                        symbol: "SUI",
                        decimals: 9,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/sui.svg",
                    },
                    [Network.Mainnet]: {
                        tokenType: TokenType.Native,
                        tokenAddress: "native",
                        name: "Sui",
                        symbol: "SUI",
                        decimals: 9,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/sui.svg",
                    }
                }
            },
            [TokenKey.USDC]: {
                [ChainKey.Solana]: {
                    [Network.Testnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
                        name: "USD Coin",
                        symbol: "USDC",
                        decimals: 6,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/usdc.svg",
                    },
                    [Network.Mainnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                        name: "USD Coin",
                        symbol: "USDC",
                        decimals: 6,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/usdc.svg",
                    }
                },
                [ChainKey.Sui]: {
                    [Network.Testnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC",
                        name: "USD Coin",
                        symbol: "USDC",
                        decimals: 6,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/usdc.svg",
                    },
                    [Network.Mainnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC",
                        name: "USD Coin",
                        symbol: "USDC",
                        decimals: 6,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/usdc.svg",
                    }
                }
            },
            [TokenKey.USDT]: {
                [ChainKey.Solana]: {
                    [Network.Testnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                        name: "USD Tether",
                        symbol: "USDT",
                        decimals: 6,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/usdt.svg",
                    },
                    [Network.Mainnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                        name: "USD Tether",
                        symbol: "USDT",
                        decimals: 6,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/usdt.svg",
                    }
                },
                [ChainKey.Sui]: {
                    [Network.Testnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "0x2::sui::SUI",
                        name: "USD Tether",
                        symbol: "USDT",
                        decimals: 6,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/usdt.svg",
                    },
                    [Network.Mainnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "0x2::sui::SUI",
                        name: "USD Tether",
                        symbol: "USDT",
                        decimals: 6,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/usdt.svg",
                    }
                }
            },
            [TokenKey.CIFARM]: {
                [ChainKey.Solana]: {
                    [Network.Testnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "CIFARM_TOKEN_ADDRESS",
                        name: "CIFARM",
                        symbol: "CIFARM",
                        decimals: 9,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/cifarm.png",
                    },
                    [Network.Mainnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "CIFARM_TOKEN_ADDRESS",
                        name: "CIFARM",
                        symbol: "CIFARM",
                        decimals: 9,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/cifarm.png",
                    }
                },
                [ChainKey.Sui]: {
                    [Network.Testnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "CIFARM_TOKEN_ADDRESS",
                        name: "CIFARM",
                        symbol: "CIFARM",
                        decimals: 9,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/cifarm.png",
                    },
                    [Network.Mainnet]: {
                        tokenType: TokenType.Standard,
                        tokenAddress: "CIFARM_TOKEN_ADDRESS",
                        name: "CIFARM",
                        symbol: "CIFARM",
                        decimals: 9,
                        imageUrl: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/cifarm.png",
                    }
                }
            }
        }

        const referral: Referral = {
            amountPerSuccessfulReferral: 5,
            amountWhenJoiningWithReferral: 20,
            amountWhenYourReferralInviteSomeone: 2
        }

        const nftConversion: NFTConversion = {
            conversionRate: 2
        }

        const energyPurchases: EnergyPurchases = {
            [Network.Testnet]: {
                options: [
                    {
                        percentage: 25,
                        price: 2,
                        tokenKey: TokenKey.USDC
                    },
                    {
                        percentage: 50,
                        price: 4,
                        tokenKey: TokenKey.USDC
                    },
                    {
                        percentage: 100,
                        price: 6,
                        tokenKey: TokenKey.USDC
                    }
                ]
            },
            [Network.Mainnet]: {
                options: [
                    {
                        percentage: 25,
                        price: 2,
                        tokenKey: TokenKey.USDC
                    },
                    {
                        percentage: 50,
                        price: 4,
                        tokenKey: TokenKey.USDC
                    },
                    {
                        percentage: 100,
                        price: 6,
                        tokenKey: TokenKey.USDC
                    }
                ]
            }
        }

        const data: Array<Partial<SystemSchema>> = [
            {
                _id: createObjectId(SystemId.Activities),
                displayId: SystemId.Activities,
                value: activities
            },
            {
                _id: createObjectId(SystemId.CropInfo),
                displayId: SystemId.CropInfo,
                value: cropInfo
            },
            {
                _id: createObjectId(SystemId.AnimalInfo),
                displayId: SystemId.AnimalInfo,
                value: animalInfo
            },
            {
                _id: createObjectId(SystemId.FruitInfo),
                displayId: SystemId.FruitInfo,
                value: fruitInfo
            },
            {
                _id: createObjectId(SystemId.DefaultInfo),
                displayId: SystemId.DefaultInfo,
                value: defaultInfo
            },
            {
                _id: createObjectId(SystemId.EnergyRegen),
                displayId: SystemId.EnergyRegen,
                value: energyRegen
            },
            {
                _id: createObjectId(SystemId.DailyRewardInfo),
                displayId: SystemId.DailyRewardInfo,
                value: dailyRewardInfo
            },
            {
                _id: createObjectId(SystemId.HoneycombInfo),
                displayId: SystemId.HoneycombInfo,
                value: honeycombInfo
            },
            {
                _id: createObjectId(SystemId.FlowerInfo),
                displayId: SystemId.FlowerInfo,
                value: flowerInfo
            },
            {
                _id: createObjectId(SystemId.BeeHouseInfo),
                displayId: SystemId.BeeHouseInfo,
                value: beeHouseInfo
            },
            {
                _id: createObjectId(SystemId.NFTCollections),
                displayId: SystemId.NFTCollections,
                value: nftCollections
            },
            {
                _id: createObjectId(SystemId.NFTBoxInfo),
                displayId: SystemId.NFTBoxInfo,
                value: nftBoxInfo
            },
            {
                _id: createObjectId(SystemId.RevenueRecipients),
                displayId: SystemId.RevenueRecipients,
                value: revenueRecipients
            },
            {
                _id: createObjectId(SystemId.GoldPurchases),
                displayId: SystemId.GoldPurchases,
                value: goldPurchases
            },
            {
                _id: createObjectId(SystemId.InteractionPermissions),
                displayId: SystemId.InteractionPermissions,
                value: interactionPermissions
            },
            {
                _id: createObjectId(SystemId.PetInfo),
                displayId: SystemId.PetInfo,
                value: petInfo
            },
            {
                _id: createObjectId(SystemId.Tokens),
                displayId: SystemId.Tokens,
                value: tokens
            },
            {
                _id: createObjectId(SystemId.Referral),
                displayId: SystemId.Referral,
                value: referral
            },
            {
                _id: createObjectId(SystemId.NFTConversion),
                displayId: SystemId.NFTConversion,
                value: nftConversion
            },
            {
                _id: createObjectId(SystemId.EnergyPurchases),
                displayId: SystemId.EnergyPurchases,
                value: energyPurchases
            }
        ]
        await this.connection.model<SystemSchema>(SystemSchema.name).insertMany(data)
    }
}

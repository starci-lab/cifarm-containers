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
    NFTCollections,
    NFTRarity,
    NFTStarterBoxInfo,
    NFTType,
    StableCoinName,
    StableCoins,
    SystemId,
    SystemSchema,
    TokenVaults
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
    ) {}

    public async drop(): Promise<void> {
        this.logger.debug("Dropping system...")
        await this.connection.model<SystemSchema>(SystemSchema.name).deleteMany({})
    }
    
    public async seed(): Promise<void> {
        try {
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
                growthStages: 5
            }
            const animalInfo: AnimalInfo = {
                randomness: {
                    sickChance: 0.5,
                    thief2: 0.8,
                    thief3: 0.95
                },
            }
            const flowerInfo: FlowerInfo = {
                randomness: {
                    thief2: 0.8,
                    thief3: 0.95,
                    needWater: 0.5,
                    isWeedyOrInfested: 1
                },
                nextGrowthStageAfterHarvest: 3,
                growthStages: 5
            }
            const fruitInfo: FruitInfo = {
                randomness: {
                    thief2: 0.8,
                    thief3: 0.95,
                    isBuggy: 1,
                },
                nextGrowthStageAfterHarvest: 3,
                growthStages: 5,
                matureGrowthStage: 3
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
                        x: 5,
                        y: 1
                    },
                    beeHouse: {
                        x: -1,
                        y: -4
                    },
                    bananaFruit: {
                        x: 3,
                        y: 3
                    },
                    coop: {
                        x: -4,
                        y: -3
                    },
                    chicken: {
                        x: -4,
                        y: 1
                    }
                },
                defaultCropId: CropId.Turnip,
                defaultSeedQuantity: 10,
                storageCapacity: 150,
                deliveryCapacity: 9,
                toolCapacity: 8,
                referredLimit: 25,
                referralRewardQuantity: 50,
                referredRewardQuantity: 10,
                followXRewardQuantity: 20,
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
                    tokens: 0,
                    day: 1,
                    lastDay: false
                },
                [DailyRewardId.Day2]: {
                    golds: 200,
                    tokens: 0,
                    day: 2,
                    lastDay: false
                },
                [DailyRewardId.Day3]: {
                    golds: 300,
                    tokens: 0,
                    day: 3,
                    lastDay: false
                },
                [DailyRewardId.Day4]: {
                    golds: 600,
                    tokens: 0,
                    day: 4,
                    lastDay: false
                },
                [DailyRewardId.Day5]: {
                    day: 5,
                    lastDay: true,
                    golds: 1000,
                    tokens: 1
                },
            }
            const nftCollections: NFTCollections = {
                [NFTType.DragonFruit]: {
                    [ChainKey.Solana]: {
                        [Network.Testnet]: {
                            collectionAddress: "8NC9J5AJZg3jmXnzopeiwwv9NJToLwnJjiPsJKFRdgKz",
                            fruitStages: {
                                stages: [
                                    {
                                        stage: 0,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiejyz3mz2stomjhqbss7nqibxcuslz4e6y2ej5adfhhdsyinadeh4"
                                    },
                                    {
                                        stage: 1,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreigf55pd26jj5wqvvhib7hvpwig3eqos6kuflibq3jnnknzidfodwu"
                                    },
                                    {
                                        stage: 2,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiaiwbynjjl4mmx6gw7sv45qntdmtwabepxhigeztralick2sttnm4"
                                    },
                                    {
                                        stage: 3,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreief3tohlrqmd7azlhwcqtcu3b3y647b2kdrzfxzjvmd3j3ohxkhuy"
                                    },
                                    {
                                        stage: 4,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreihanv6yjccq67p4tx7hzdo2sfdceot76h7y3wytjsshx6kyin22ye"
                                    }
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
                            collectionAddress: "8NC9J5AJZg3jmXnzopeiwwv9NJToLwnJjiPsJKFRdgKz",
                            fruitStages: {
                                stages: [
                                    {
                                        stage: 0,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiejyz3mz2stomjhqbss7nqibxcuslz4e6y2ej5adfhhdsyinadeh4"
                                    },
                                    {
                                        stage: 1,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreigf55pd26jj5wqvvhib7hvpwig3eqos6kuflibq3jnnknzidfodwu"
                                    },
                                    {
                                        stage: 2,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiaiwbynjjl4mmx6gw7sv45qntdmtwabepxhigeztralick2sttnm4"
                                    },
                                    {
                                        stage: 3,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreief3tohlrqmd7azlhwcqtcu3b3y647b2kdrzfxzjvmd3j3ohxkhuy"
                                    },
                                    {
                                        stage: 4,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreihanv6yjccq67p4tx7hzdo2sfdceot76h7y3wytjsshx6kyin22ye"
                                    }
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
                },
                [NFTType.Jackfruit]: {
                    [ChainKey.Solana]: {
                        [Network.Testnet]: {
                            collectionAddress: "8NC9J5AJZg3jmXnzopeiwwv9NJToLwnJjiPsJKFRdgKz",
                            fruitStages: {
                                stages: [
                                    {
                                        stage: 0,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiejyz3mz2stomjhqbss7nqibxcuslz4e6y2ej5adfhhdsyinadeh4"
                                    },
                                    {
                                        stage: 1,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreigf55pd26jj5wqvvhib7hvpwig3eqos6kuflibq3jnnknzidfodwu"
                                    },
                                    {
                                        stage: 2,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiaiwbynjjl4mmx6gw7sv45qntdmtwabepxhigeztralick2sttnm4"
                                    },
                                    {
                                        stage: 3,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreief3tohlrqmd7azlhwcqtcu3b3y647b2kdrzfxzjvmd3j3ohxkhuy"
                                    },
                                    {
                                        stage: 4,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreihanv6yjccq67p4tx7hzdo2sfdceot76h7y3wytjsshx6kyin22ye"
                                    }
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
                            collectionAddress: "8NC9J5AJZg3jmXnzopeiwwv9NJToLwnJjiPsJKFRdgKz",
                            fruitStages: {
                                stages: [
                                    {
                                        stage: 0,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiejyz3mz2stomjhqbss7nqibxcuslz4e6y2ej5adfhhdsyinadeh4"
                                    },
                                    {
                                        stage: 1,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreigf55pd26jj5wqvvhib7hvpwig3eqos6kuflibq3jnnknzidfodwu"
                                    },
                                    {
                                        stage: 2,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiaiwbynjjl4mmx6gw7sv45qntdmtwabepxhigeztralick2sttnm4"
                                    },
                                    {
                                        stage: 3,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreief3tohlrqmd7azlhwcqtcu3b3y647b2kdrzfxzjvmd3j3ohxkhuy"
                                    },
                                    {
                                        stage: 4,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreihanv6yjccq67p4tx7hzdo2sfdceot76h7y3wytjsshx6kyin22ye"
                                    }
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
                },
                [NFTType.Pomegranate]: {
                    [ChainKey.Solana]: {
                        [Network.Testnet]: {
                            collectionAddress: "8NC9J5AJZg3jmXnzopeiwwv9NJToLwnJjiPsJKFRdgKz",
                            fruitStages: {
                                stages: [
                                    {
                                        stage: 0,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiejyz3mz2stomjhqbss7nqibxcuslz4e6y2ej5adfhhdsyinadeh4"
                                    }
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
                            collectionAddress: "8NC9J5AJZg3jmXnzopeiwwv9NJToLwnJjiPsJKFRdgKz",
                            fruitStages: {
                                stages: [
                                    {
                                        stage: 0,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiejyz3mz2stomjhqbss7nqibxcuslz4e6y2ej5adfhhdsyinadeh4"
                                    }
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
                },
                [NFTType.Rambutan]: {
                    [ChainKey.Solana]: {
                        [Network.Testnet]: {
                            collectionAddress: "8NC9J5AJZg3jmXnzopeiwwv9NJToLwnJjiPsJKFRdgKz",
                            fruitStages: {
                                stages: [
                                    {
                                        stage: 0,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiejyz3mz2stomjhqbss7nqibxcuslz4e6y2ej5adfhhdsyinadeh4"
                                    },
                                    {
                                        stage: 1,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreigf55pd26jj5wqvvhib7hvpwig3eqos6kuflibq3jnnknzidfodwu"
                                    },
                                    {
                                        stage: 2,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiaiwbynjjl4mmx6gw7sv45qntdmtwabepxhigeztralick2sttnm4"
                                    },
                                    {
                                        stage: 3,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreief3tohlrqmd7azlhwcqtcu3b3y647b2kdrzfxzjvmd3j3ohxkhuy"
                                    },
                                    {
                                        stage: 4,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreihanv6yjccq67p4tx7hzdo2sfdceot76h7y3wytjsshx6kyin22ye"
                                    }
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
                            collectionAddress: "8NC9J5AJZg3jmXnzopeiwwv9NJToLwnJjiPsJKFRdgKz",
                            fruitStages: {
                                stages: [
                                    {
                                        stage: 0,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiejyz3mz2stomjhqbss7nqibxcuslz4e6y2ej5adfhhdsyinadeh4"
                                    },
                                    {
                                        stage: 1,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreigf55pd26jj5wqvvhib7hvpwig3eqos6kuflibq3jnnknzidfodwu"
                                    },
                                    {
                                        stage: 2,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiaiwbynjjl4mmx6gw7sv45qntdmtwabepxhigeztralick2sttnm4"
                                    },
                                    {
                                        stage: 3,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreief3tohlrqmd7azlhwcqtcu3b3y647b2kdrzfxzjvmd3j3ohxkhuy"
                                    },
                                    {
                                        stage: 4,
                                        imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreihanv6yjccq67p4tx7hzdo2sfdceot76h7y3wytjsshx6kyin22ye"
                                    }
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

            const nftStarterBoxInfo: NFTStarterBoxInfo = {
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
                boxPrice: 0.1 // 0.1 USDC
            }

            const stableCoins: StableCoins = {
                [StableCoinName.USDC]: {
                    [ChainKey.Solana]: {
                        [Network.Testnet]: {
                            address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
                            decimals: 6
                        },
                        [Network.Mainnet]: {
                            address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
                            decimals: 6
                        }
                    }
                }
            }

            const tokenVaults: TokenVaults = {
                [ChainKey.Solana]: {
                    [Network.Testnet]: {
                        address: "D2HHp9gtFgs8dKtV6Hg2xgLv998HrwsyaWAeHkfuCJxJ",
                        decimals: 6
                    },
                    [Network.Mainnet]: {
                        address: "D2HHp9gtFgs8dKtV6Hg2xgLv998HrwsyaWAeHkfuCJxJ",
                        decimals: 6
                    }
                },
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
                    _id: createObjectId(SystemId.NFTStarterBoxInfo),
                    displayId: SystemId.NFTStarterBoxInfo,
                    value: nftStarterBoxInfo
                },
                {
                    _id: createObjectId(SystemId.StableCoins),
                    displayId: SystemId.StableCoins,
                    value: stableCoins
                },
                {
                    _id: createObjectId(SystemId.TokenVaults),
                    displayId: SystemId.TokenVaults,
                    value: tokenVaults
                }
            ]
            await this.connection.model<SystemSchema>(SystemSchema.name).insertMany(data)
        } catch (error) {
            this.logger.error(error)
        }
    }
}

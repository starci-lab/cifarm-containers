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
    NFTBoxInfo,
    NFTType,
    ProductId,
    StableCoinName,
    StableCoins,
    SystemId,
    SystemSchema,
    TokenVaults,
    WholesaleMarket,
    PaymentKind,
    RevenueRecipients,
    GoldPurchases,
    InteractionPermissions,
    PetInfo
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
            matureGrowthStage: 3,
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
        const nftCollections: NFTCollections = {
            [NFTType.DragonFruit]: {
                [ChainKey.Solana]: {
                    [Network.Testnet]: {
                        name: "Dragon Fruit",
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
                        name: "Dragon Fruit",
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
                        name: "Jackfruit",
                        collectionAddress: "2Ap4nT8Pby5LUEB7TvbwsLUnr1q7NBBCoLQZR4Ei3dNh",
                        fruitStages: {
                            stages: [
                                {
                                    stage: 0,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiak2uhq3p7i7opwdnqrmslkmxdbliuzmwmw6riie6okurhypkjjcq"
                                },
                                {
                                    stage: 1,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreids4ezcjpym3xf3hwelnobtl5744cbdebal566bqtq36bo3cupnti"
                                },
                                {
                                    stage: 2,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreigwig65u5amdczpgigbu4cauksmlravhkavi2mruqhdvobjv3frpa"
                                },
                                {
                                    stage: 3,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreibv7hz23vx5lhrpveooivkrmddd63uz75nqjfwzclfolqqzwlupwm"
                                },
                                {
                                    stage: 4,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreicjj3agbxozskonq646i5i6q6srlp6pami7dlxl4mvqok5y6ldocm"
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
                        name: "Jackfruit",
                        collectionAddress: "2Ap4nT8Pby5LUEB7TvbwsLUnr1q7NBBCoLQZR4Ei3dNh",
                        fruitStages: {
                            stages: [
                                {
                                    stage: 0,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreiak2uhq3p7i7opwdnqrmslkmxdbliuzmwmw6riie6okurhypkjjcq"
                                },
                                {
                                    stage: 1,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreids4ezcjpym3xf3hwelnobtl5744cbdebal566bqtq36bo3cupnti"
                                },
                                {
                                    stage: 2,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreigwig65u5amdczpgigbu4cauksmlravhkavi2mruqhdvobjv3frpa"
                                },
                                {
                                    stage: 3,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreibv7hz23vx5lhrpveooivkrmddd63uz75nqjfwzclfolqqzwlupwm"
                                },
                                {
                                    stage: 4,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreicjj3agbxozskonq646i5i6q6srlp6pami7dlxl4mvqok5y6ldocm"
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
                        name: "Pomegranate",
                        collectionAddress: "CRUwWJr8eAPaHoj7kA5WrpKMSiotV9vdMxdXUJLZfe9b",
                        fruitStages: {
                            stages: [
                                {
                                    stage: 0,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreicg5i2jjhwnp4bxgzqml5ziugsezjcylbd5taqlaohh63rpbvczqa"
                                },
                                {
                                    stage: 1,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreibps4efh5i4jhqgy5jaeokmuhynu653ay2seqxqjmrsbccyzqrksa"
                                },
                                {
                                    stage: 2,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreidmh3ntrfbraqgmubvk3g7ov54otm4wth456yr3uwegmmdvjvhkb4"
                                },
                                {
                                    stage: 3,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreih7sl3efh4zegtttut3c5l25ywa2ux3afbzyxoo346o54nd6xz2nq"
                                },
                                {
                                    stage: 4,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreidg53fkyp2ho4f4v62rqb7awrdktu465la3lk6q63aketivkbyf2u"
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
                        name: "Pomegranate",
                        collectionAddress: "CRUwWJr8eAPaHoj7kA5WrpKMSiotV9vdMxdXUJLZfe9b",
                        fruitStages: {
                            stages: [
                                {
                                    stage: 0,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreicg5i2jjhwnp4bxgzqml5ziugsezjcylbd5taqlaohh63rpbvczqa"
                                },
                                {
                                    stage: 1,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreibps4efh5i4jhqgy5jaeokmuhynu653ay2seqxqjmrsbccyzqrksa"
                                },
                                {
                                    stage: 2,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreidmh3ntrfbraqgmubvk3g7ov54otm4wth456yr3uwegmmdvjvhkb4"
                                },
                                {
                                    stage: 3,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreih7sl3efh4zegtttut3c5l25ywa2ux3afbzyxoo346o54nd6xz2nq"
                                },
                                {
                                    stage: 4,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreidg53fkyp2ho4f4v62rqb7awrdktu465la3lk6q63aketivkbyf2u"
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
                        name: "Rambutan",
                        collectionAddress: "4rM1G8YE7JxJPWuENSv1X5gkn6PYEJ8Wuc6bS8DZBz8K",
                        fruitStages: {
                            stages: [
                                {
                                    stage: 0,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreifojfrzhqvcuo35qkdwtjhiz73v65narov2ecx677jvn4szb5evba"
                                },
                                {
                                    stage: 1,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreigr6ytjpxmces34mql4x5ibknb7r3w73qxg5shvsclpoakeq2fwmy"
                                },
                                {
                                    stage: 2,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreich2uoijlel36l23b4jdo3gt3jp532wew6gromq66z7ng7dyzhv6i"
                                },
                                {
                                    stage: 3,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreihbhc6ertoa4aibh2bay7lfqor6w7dcof6jfhedk6iqiemghnm5ai"
                                },
                                {
                                    stage: 4,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreifodqo5eicqvcq25mydbnkpvo4yymengndqw3izmdjttq2tqy5beu"
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
                        name: "Rambutan",
                        collectionAddress: "4rM1G8YE7JxJPWuENSv1X5gkn6PYEJ8Wuc6bS8DZBz8K",
                        fruitStages: {
                            stages: [
                                {
                                    stage: 0,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreifojfrzhqvcuo35qkdwtjhiz73v65narov2ecx677jvn4szb5evba"
                                },
                                {
                                    stage: 1,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreigr6ytjpxmces34mql4x5ibknb7r3w73qxg5shvsclpoakeq2fwmy"
                                },
                                {
                                    stage: 2,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreich2uoijlel36l23b4jdo3gt3jp532wew6gromq66z7ng7dyzhv6i"
                                },
                                {
                                    stage: 3,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreihbhc6ertoa4aibh2bay7lfqor6w7dcof6jfhedk6iqiemghnm5ai"
                                },
                                {
                                    stage: 4,
                                    imageUrl: "https://amethyst-magnetic-opossum-945.mypinata.cloud/ipfs/bafkreifodqo5eicqvcq25mydbnkpvo4yymengndqw3izmdjttq2tqy5beu"
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
            paymentKind: PaymentKind.USDC,
            boxPrice: 0.5, // 0.5 USDC
            feePercentage: 0.02 // 2% to fee collector, will to the fee collector address
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
                    maxPaidAmount: 5,
                    maxPaidDecreasePercentage: 0.01,
                    vaultPaidPercentage: 0.05
                },
                [Network.Mainnet]: {
                    maxPaidAmount: 5,
                    maxPaidDecreasePercentage: 0.01,
                    vaultPaidPercentage: 0.05
                }
            },
        }

        const wholesaleMarket: WholesaleMarket = {
            products: [
                {
                    productId: createObjectId(ProductId.DragonFruitQuality),
                    quantity: 20,
                },
                {
                    productId: createObjectId(ProductId.JackfruitQuality),
                    quantity: 20,
                },
                {
                    productId: createObjectId(ProductId.RambutanQuality),
                    quantity: 20,
                },
                {
                    productId: createObjectId(ProductId.PomegranateQuality),
                    quantity: 20,
                },
            ],
            price: 5,
            paymentKind: PaymentKind.USDC
        }

        const revenueRecipients: RevenueRecipients = {
            [ChainKey.Solana]: {
                [Network.Testnet]: {
                    address: "D2HHp9gtFgs8dKtV6Hg2xgLv998HrwsyaWAeHkfuCJxJ"
                },
                [Network.Mainnet]: {
                    address: "D2HHp9gtFgs8dKtV6Hg2xgLv998HrwsyaWAeHkfuCJxJ"
                }
            }
        }

        const goldPurchases: GoldPurchases = {
            [ChainKey.Solana]: {
                [Network.Testnet]: {
                    options: [
                        {
                            amount: 10000,
                            price: 1,
                            paymentKind: PaymentKind.USDC
                        },
                        {
                            amount: 100000,
                            price: 5,
                            paymentKind: PaymentKind.USDC
                        },
                        {
                            amount: 1000000,
                            price: 25,
                            paymentKind: PaymentKind.USDC
                        }
                    ]
                },
                [Network.Mainnet]: {
                    options: [
                        {
                            amount: 10000,
                            price: 1,
                            paymentKind: PaymentKind.USDC
                        },
                        {
                            amount: 100000,
                            price: 5,
                            paymentKind: PaymentKind.USDC
                        },
                        {
                            amount: 1000000,
                            price: 25,
                            paymentKind: PaymentKind.USDC
                        }, 
                    ]
                }
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
                _id: createObjectId(SystemId.StableCoins),
                displayId: SystemId.StableCoins,
                value: stableCoins
            },
            {
                _id: createObjectId(SystemId.TokenVaults),
                displayId: SystemId.TokenVaults,
                value: tokenVaults
            },
            {
                _id: createObjectId(SystemId.WholesaleMarket),
                displayId: SystemId.WholesaleMarket,
                value: wholesaleMarket
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
            }
        ]
        await this.connection.model<SystemSchema>(SystemSchema.name).insertMany(data)
    }
}

import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common"
import {
    Activities,
    AnimalEntity,
    AnimalId,
    AnimalType,
    AvailableInType,
    BuildingEntity,
    BuildingId,
    CropEntity,
    CropId,
    DailyRewardEntity,
    DailyRewardId,
    DailyRewardPossibility,
    DailyRewardPossibilityId,
    ProductId,
    ProductType,
    SpinEntity,
    SpinId,
    SpinType,
    SupplyEntity,
    SupplyId,
    SupplyType,
    SystemEntity,
    SystemId,
    TileEntity,
    TileId,
    ToolEntity,
    ToolId,
    UpgradeEntity,
    UpgradeId
} from "@src/database"
import { Cache } from "cache-manager"
import { DataSource, DeepPartial, QueryRunner } from "typeorm"

@Injectable()
export class SeedDataService implements OnModuleInit {
    private readonly logger = new Logger(SeedDataService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async onModuleInit() {
        await this.clearPostgresData()
        await this.clearRedisCacheData()
        await this.seedData()
        // await this.saveDataToRedis()
    }

    private async clearRedisCacheData() {
        this.logger.log("Clearing cache data started")

        try {
            await this.cacheManager.reset()
            this.logger.log("Cache data cleared successfully")
        } catch (error) {
            this.logger.error(`Failed to clear cache data: ${error.message}`)
            throw error
        }
    }

    private async clearPostgresData() {
        this.logger.log("Clearing old data started")
        const queryRunner: QueryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()

            await Promise.all([
                queryRunner.manager.delete(AnimalEntity, {}),
                queryRunner.manager.delete(CropEntity, {}),
                queryRunner.manager.delete(UpgradeEntity, {}),
                queryRunner.manager.delete(BuildingEntity, {}),
                queryRunner.manager.delete(ToolEntity, {}),
                queryRunner.manager.delete(TileEntity, {}),
                queryRunner.manager.delete(SupplyEntity, {}),
                queryRunner.manager.delete(DailyRewardPossibility, {}),
                queryRunner.manager.delete(DailyRewardEntity, {}),
                queryRunner.manager.delete(SpinEntity, {}),
                queryRunner.manager.delete(SystemEntity, {})
            ])

            await queryRunner.commitTransaction()
            this.logger.log("Clearing old data finished")
        } catch (error) {
            await queryRunner.rollbackTransaction()
            this.logger.error("Error clearing data:", error)
        } finally {
            await queryRunner.release()
        }
    }

    private async seedData() {
        this.logger.log("Seeding data started")
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()

            await Promise.all([
                this.seedAnimalData(queryRunner),
                this.seedCropData(queryRunner),
                this.seedBuildingData(queryRunner),
                this.seedToolData(queryRunner),
                this.seedTileData(queryRunner),
                this.seedSupplyData(queryRunner),
                this.seedDailyRewardData(queryRunner),
                this.seedSpinData(queryRunner),
                this.seedSystemData(queryRunner)
            ])

            await queryRunner.commitTransaction()
            this.logger.log("Seeding data finished")
        } catch (error) {
            await queryRunner.rollbackTransaction()
            this.logger.error("Error seeding data:", error)
        } finally {
            await queryRunner.release()
        }
    }

    private async seedSystemData(queryRunner: QueryRunner) {
        const activities: Activities = {
            cureAnimal: {
                energyCost: 1,
                experiencesGain: 3
            },
            feedAnimal: {
                energyCost: 1,
                experiencesGain: 3
            },
            helpCureAnimal: {
                energyCost: 1,
                experiencesGain: 3
            },
            helpUseHerbicide: {
                energyCost: 1,
                experiencesGain: 3
            },
            helpUsePestiside: {
                energyCost: 1,
                experiencesGain: 3
            },
            helpWater: {
                energyCost: 1,
                experiencesGain: 3
            },
            thiefAnimalProduct: {
                energyCost: 1,
                experiencesGain: 3
            },
            thiefCrop: {
                energyCost: 1,
                experiencesGain: 3
            },
            useFertilizer: {
                energyCost: 1,
                experiencesGain: 3
            },
            useHerbicide: {
                energyCost: 1,
                experiencesGain: 3
            },
            usePestiside: {
                energyCost: 1,
                experiencesGain: 3
            },
            water: {
                energyCost: 1,
                experiencesGain: 3
            }
        }
        const data: Array<DeepPartial<SystemEntity>> = [
            {
                id: SystemId.Activities,
                value: activities
            }
        ]
        await queryRunner.manager.save(SystemEntity, data)
    }
    private async seedAnimalData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<AnimalEntity>> = [
            {
                id: AnimalId.Chicken,
                yieldTime: 60 * 60 * 24,
                offspringPrice: 1000,
                isNFT: false,
                growthTime: 60 * 60 * 24 * 3,
                availableInShop: true,
                hungerTime: 60 * 60 * 12,
                minHarvestQuantity: 14,
                maxHarvestQuantity: 20,
                basicHarvestExperiences: 32,
                premiumHarvestExperiences: 96,
                type: AnimalType.Poultry,
                sickChance: 0.001,
                product: {
                    id: ProductId.Egg,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Animal
                }
            },
            {
                id: AnimalId.Cow,
                yieldTime: 60 * 60 * 24 * 2,
                offspringPrice: 2500,
                isNFT: false,
                growthTime: 60 * 60 * 24 * 7,
                availableInShop: true,
                hungerTime: 60 * 60 * 12,
                minHarvestQuantity: 14,
                maxHarvestQuantity: 20,
                basicHarvestExperiences: 32,
                premiumHarvestExperiences: 96,
                type: AnimalType.Livestock,
                sickChance: 0.001,
                product: {
                    id: ProductId.Milk,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Animal
                }
            }
        ]
        await queryRunner.manager.save(AnimalEntity, data)
    }

    private async seedCropData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<CropEntity>> = [
            {
                id: CropId.Carrot,
                price: 50,
                growthStageDuration: 3600,
                growthStages: 5,
                basicHarvestExperiences: 12,
                premiumHarvestExperiences: 60,
                minHarvestQuantity: 14,
                maxHarvestQuantity: 20,
                premium: false,
                perennial: false,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.Carrot,
                    isPremium: false,
                    goldAmount: 4,
                    tokenAmount: 0.02,
                    type: ProductType.Crop
                }
            },
            {
                id: CropId.Potato,
                price: 100,
                growthStageDuration: 9000,
                growthStages: 5,
                basicHarvestExperiences: 21,
                premiumHarvestExperiences: 110,
                minHarvestQuantity: 16,
                maxHarvestQuantity: 23,
                premium: false,
                perennial: false,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.Potato,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Crop
                }
            },
            {
                id: CropId.Cucumber,
                price: 100,
                growthStageDuration: 9000,
                growthStages: 5,
                basicHarvestExperiences: 21,
                premiumHarvestExperiences: 110,
                minHarvestQuantity: 16,
                maxHarvestQuantity: 23,
                premium: false,
                perennial: false,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.BellPepper,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Crop
                }
            },
            {
                id: CropId.Pineapple,
                price: 100,
                growthStageDuration: 9000,
                growthStages: 5,
                basicHarvestExperiences: 21,
                premiumHarvestExperiences: 110,
                minHarvestQuantity: 16,
                maxHarvestQuantity: 23,
                premium: false,
                perennial: false,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.Cucumber,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Crop
                }
            },
            {
                id: CropId.Watermelon,
                price: 100,
                growthStageDuration: 9000,
                growthStages: 5,
                basicHarvestExperiences: 21,
                premiumHarvestExperiences: 110,
                minHarvestQuantity: 16,
                maxHarvestQuantity: 23,
                premium: false,
                perennial: false,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.Pineapple,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Crop
                }
            },
            {
                id: CropId.BellPepper,
                price: 100,
                growthStageDuration: 9000,
                growthStages: 5,
                basicHarvestExperiences: 21,
                premiumHarvestExperiences: 110,
                minHarvestQuantity: 16,
                maxHarvestQuantity: 23,
                premium: false,
                perennial: false,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.Watermelon,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Crop
                }
            }
        ]

        await queryRunner.manager.save(CropEntity, data)
    }

    private async seedBuildingData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<BuildingEntity>> = [
            {
                id: BuildingId.Coop,
                availableInShop: true,
                type: AnimalType.Poultry,
                maxUpgrade: 2,
                price: 2000,
                upgrades: [
                    {
                        id: UpgradeId.CoopUpgrade1,
                        upgradePrice: 0,
                        capacity: 3
                    },
                    {
                        id: UpgradeId.CoopUpgrade2,
                        upgradePrice: 1000,
                        capacity: 5
                    },
                    {
                        id: UpgradeId.CoopUpgrade3,
                        upgradePrice: 2000,
                        capacity: 10
                    }
                ]
            },
            {
                id: BuildingId.Pasture,
                availableInShop: true,
                type: AnimalType.Livestock,
                maxUpgrade: 2,
                price: 3000,
                upgrades: [
                    {
                        id: UpgradeId.PastureUpgrade1,
                        upgradePrice: 0,
                        capacity: 3
                    },
                    {
                        id: UpgradeId.PastureUpgrade2,
                        upgradePrice: 1000,
                        capacity: 5
                    },
                    {
                        id: UpgradeId.PastureUpgrade3,
                        upgradePrice: 2000,
                        capacity: 10
                    }
                ]
            },
            {
                id: BuildingId.Home,
                availableInShop: false,
                maxUpgrade: 0,
                price: 0,
                upgrades: []
            }
        ]

        await queryRunner.manager.save(BuildingEntity, data)
    }
    private async seedToolData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<ToolEntity>> = [
            { id: ToolId.Scythe, availableIn: AvailableInType.Home, index: 0 },
            { id: ToolId.Steal, availableIn: AvailableInType.Neighbor, index: 1 },
            { id: ToolId.WaterCan, availableIn: AvailableInType.Both, index: 2 },
            { id: ToolId.Herbicide, availableIn: AvailableInType.Both, index: 3 },
            { id: ToolId.Pesticide, availableIn: AvailableInType.Both, index: 4 }
        ]
        await queryRunner.manager.save(ToolEntity, data)
    }
    private async seedTileData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<TileEntity>> = [
            {
                id: TileId.StarterTile,
                price: 0,
                maxOwnership: 6,
                isNFT: false,
                availableInShop: true
            },
            {
                id: TileId.BasicTile1,
                price: 1000,
                maxOwnership: 10,
                isNFT: false,
                availableInShop: true
            },
            {
                id: TileId.BasicTile2,
                price: 2500,
                maxOwnership: 30,
                isNFT: false,
                availableInShop: true
            },
            {
                id: TileId.BasicTile3,
                price: 10000,
                maxOwnership: 9999,
                isNFT: false,
                availableInShop: true
            },
            {
                id: TileId.FertileTile,
                price: 0,
                maxOwnership: 0,
                isNFT: true,
                availableInShop: false
            }
        ]

        queryRunner.manager.save(TileEntity, data)
    }
    private async seedSupplyData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<SupplyEntity>> = [
            {
                id: SupplyId.BasicFertilizer,
                type: SupplyType.AnimalFeed,
                price: 50,
                availableInShop: true,
                fertilizerEffectTimeReduce: 60 * 30,
                maxStack: 16
            },
            {
                id: SupplyId.AnimalFeed,
                type: SupplyType.AnimalFeed,
                price: 50,
                availableInShop: true,
                maxStack: 16
            }
        ]

        await queryRunner.manager.save(SupplyEntity, data)
    }
    private async seedDailyRewardData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<DailyRewardEntity>> = [
            {
                id: DailyRewardId.Day1,
                amount: 100,
                day: 1,
                isLastDay: false
            },
            {
                id: DailyRewardId.Day2,
                amount: 200,
                day: 2,
                isLastDay: false
            },
            {
                id: DailyRewardId.Day3,
                amount: 300,
                day: 3,
                isLastDay: false
            },
            {
                id: DailyRewardId.Day4,
                amount: 600,
                day: 4,
                isLastDay: false
            },
            {
                id: DailyRewardId.Day5,
                day: 5,
                isLastDay: true,
                dailyRewardPossibilities: [
                    {
                        id: DailyRewardPossibilityId.Possibility1,
                        goldAmount: 1000,
                        thresholdMin: 0,
                        thresholdMax: 0.8
                    },
                    {
                        id: DailyRewardPossibilityId.Possibility2,
                        goldAmount: 1500,
                        thresholdMin: 0.8,
                        thresholdMax: 0.9
                    },
                    {
                        id: DailyRewardPossibilityId.Possibility3,
                        goldAmount: 2000,
                        thresholdMin: 0.9,
                        thresholdMax: 0.95
                    },
                    {
                        id: DailyRewardPossibilityId.Possibility4,
                        tokenAmount: 3,
                        thresholdMin: 0.95,
                        thresholdMax: 0.99
                    },
                    {
                        id: DailyRewardPossibilityId.Possibility5,
                        tokenAmount: 10,
                        thresholdMin: 0.99,
                        thresholdMax: 1
                    }
                ]
            }
        ]

        await queryRunner.manager.save(DailyRewardEntity, data)
    }
    private async seedSpinData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<SpinEntity>> = [
            {
                id: SpinId.Gold1,
                type: SpinType.Gold,
                goldAmount: 100,
                thresholdMin: 0,
                thresholdMax: 0.2
            },
            {
                id: SpinId.Gold2,
                type: SpinType.Gold,
                goldAmount: 250,
                thresholdMin: 0.2,
                thresholdMax: 0.35
            },
            {
                id: SpinId.Gold3,
                type: SpinType.Gold,
                goldAmount: 500,
                thresholdMin: 0.35,
                thresholdMax: 0.45
            },
            {
                id: SpinId.Gold4,
                type: SpinType.Gold,
                goldAmount: 200,
                thresholdMin: 0.45,
                thresholdMax: 0.5
            },
            {
                id: SpinId.Seed1,
                type: SpinType.Seed,
                quantity: 2,
                thresholdMin: 0.5,
                thresholdMax: 0.65
            },
            {
                id: SpinId.Seed2,
                type: SpinType.Seed,
                quantity: 2,
                thresholdMin: 0.65,
                thresholdMax: 0.8
            },
            {
                id: SpinId.BasicFertilizer,
                type: SpinType.Supply,
                quantity: 4,
                thresholdMin: 0.8,
                thresholdMax: 0.99
            },
            {
                id: SpinId.Token,
                type: SpinType.Token,
                tokenAmount: 15,
                thresholdMin: 0.99,
                thresholdMax: 1
            }
        ]

        await queryRunner.manager.save(SpinEntity, data)
    }
}

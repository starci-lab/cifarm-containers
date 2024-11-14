import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { REDIS_KEY } from "@src/constants"
import {
    AnimalEntity,
    AnimalKey,
    AnimalType,
    AvailableInType,
    BuildingEntity,
    BuildingKey,
    CropEntity,
    CropKey,
    DailyRewardEntity,
    DailyRewardKey,
    DailyRewardPossibility,
    DailyRewardPossibilityKey,
    ProductEntity,
    ProductType,
    SpinEntity,
    SpinKey,
    SpinType,
    SupplyEntity,
    SupplyKey,
    SupplyType,
    TileEntity,
    TileKey,
    ToolEntity,
    ToolKey,
    UpgradeEntity,
    UpgradeKey
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
        // await this.clearPostgresData()
        await this.clearRedisCacheData()
        await this.seedData()
        await this.saveDataToRedis()
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

    private async saveDataToRedis() {
        this.logger.log("Saving data to Redis started")
        try {
            const [
                animals,
                crops,
                buildings,
                tools,
                tiles,
                supplies,
                dailyRewards,
                spins,
                marketPricings
            ] = await Promise.all([
                this.dataSource.manager.find(AnimalEntity),
                this.dataSource.manager.find(CropEntity),
                this.dataSource.manager.find(BuildingEntity),
                this.dataSource.manager.find(ToolEntity),
                this.dataSource.manager.find(TileEntity),
                this.dataSource.manager.find(SupplyEntity),
                this.dataSource.manager.find(DailyRewardEntity),
                this.dataSource.manager.find(SpinEntity),
                this.dataSource.manager.find(ProductEntity)
            ])
            // Save each data type to Redis concurrently
            await Promise.all([
                this.cacheManager.set(REDIS_KEY.ANIMALS, animals),
                this.cacheManager.set(REDIS_KEY.CROPS, crops),
                this.cacheManager.set(REDIS_KEY.BUILDINGS, buildings),
                this.cacheManager.set(REDIS_KEY.TOOLS, tools),
                this.cacheManager.set(REDIS_KEY.TILES, tiles),
                this.cacheManager.set(REDIS_KEY.SUPPLIES, supplies),
                this.cacheManager.set(REDIS_KEY.DAILY_REWARDS, dailyRewards),
                this.cacheManager.set(REDIS_KEY.SPINS, spins),
                this.cacheManager.set(REDIS_KEY.MARKET_PRICINGS, marketPricings)
            ])
            this.logger.log("Data saved to Redis successfully")
        } catch (error) {
            this.logger.error(`Failed to save data to Redis: ${error.message}`)
            throw error
        }
    }
    private async clearPostgresData() {
        this.logger.log("Clearing old data started")
        const queryRunner: QueryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()

            // Fetch and drop all foreign key constraints
            const foreignKeys = await queryRunner.query(`
                SELECT 
                    tc.constraint_name, 
                    tc.table_name 
                FROM 
                    information_schema.table_constraints AS tc 
                WHERE 
                    tc.constraint_type = 'FOREIGN KEY';
            `)

            for (const key of foreignKeys) {
                await queryRunner.query(
                    `ALTER TABLE "${key.table_name}" DROP CONSTRAINT "${key.constraint_name}";`
                )
            }

            // Now delete data from all tables in the appropriate order
            await queryRunner.manager.createQueryBuilder().delete().from(ProductEntity).execute()

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
                queryRunner.manager.delete(SpinEntity, {})
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
                this.seedSpinData(queryRunner)
            ])
            // await this.seedProducts(queryRunner)

            await queryRunner.commitTransaction()
            this.logger.log("Seeding data finished")
        } catch (error) {
            await queryRunner.rollbackTransaction()
            this.logger.error("Error seeding data:", error)
        } finally {
            await queryRunner.release()
        }
    }

    private async seedAnimalData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<AnimalEntity>> = [
            {
                id: AnimalKey.Chicken,
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
                sickChance: 0.001
            },
            {
                id: AnimalKey.Cow,
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
                sickChance: 0.001
            }
        ]
        await queryRunner.manager.save(AnimalEntity, data)
    }

    private async seedCropData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<CropEntity>> = [
            {
                id: CropKey.Carrot,
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
                maxStack: 16
            },
            {
                id: CropKey.Potato,
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
                maxStack: 16
            },
            {
                id: CropKey.Cucumber,
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
                maxStack: 16
            },
            {
                id: CropKey.Pineapple,
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
                maxStack: 16
            },
            {
                id: CropKey.Watermelon,
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
                maxStack: 16
            },
            {
                id: CropKey.BellPepper,
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
                maxStack: 16
            }
        ]

        await queryRunner.manager.save(CropEntity, data)
    }

    // private async seedProducts(queryRunner: QueryRunner) {
    //     const chicken:AnimalEntity = await queryRunner.manager.findOne(AnimalEntity, { where: { id: AnimalKey.Chicken } })
    //     const cow:AnimalEntity = await queryRunner.manager.findOne(AnimalEntity, { where: { id: AnimalKey.Cow } })
    //     const carrot:CropEntity = await queryRunner.manager.findOne(CropEntity, { where: { id: CropKey.Carrot } })
    //     const potato:CropEntity = await queryRunner.manager.findOne(CropEntity, { where: { id: CropKey.Potato } })
    //     const bellPepper:CropEntity = await queryRunner.manager.findOne(CropEntity, { where: { id: CropKey.BellPepper } })
    //     const cucumber:CropEntity = await queryRunner.manager.findOne(CropEntity, { where: { id: CropKey.Cucumber } })
    //     const pineapple:CropEntity = await queryRunner.manager.findOne(CropEntity, { where: { id: CropKey.Pineapple } })
    //     const watermelon:CropEntity = await queryRunner.manager.findOne(CropEntity, { where: { id: CropKey.Watermelon } })

    //     const data: Array<DeepPartial<ProductEntity>> = [
    //         {
    //             isPremium: false,
    //             goldAmount: 8,
    //             tokenAmount: 0.04,
    //             type: ProductType.Animal,
    //             animal: chicken,
    //         },
    //         {
    //             isPremium: false,
    //             goldAmount: 8,
    //             tokenAmount: 0.04,
    //             type: ProductType.Animal,
    //             animal: cow,
    //         },
    //         {
    //             isPremium: false,
    //             goldAmount: 4,
    //             tokenAmount: 0.02,
    //             type: ProductType.Crop,
    //             crop: carrot,
    //         },
    //         {
    //             isPremium: false,
    //             goldAmount: 8,
    //             tokenAmount: 0.04,
    //             type: ProductType.Crop,
    //             crop: potato,
    //         },
    //         {
    //             isPremium: false,
    //             goldAmount: 8,
    //             tokenAmount: 0.04,
    //             type: ProductType.Crop,
    //             crop: bellPepper,
    //         },
    //         {
    //             isPremium: false,
    //             goldAmount: 8,
    //             tokenAmount: 0.04,
    //             type: ProductType.Crop,
    //             crop: cucumber,
    //         },
    //         {
    //             isPremium: false,
    //             goldAmount: 8,
    //             tokenAmount: 0.04,
    //             type: ProductType.Crop,
    //             crop: pineapple,
    //         },
    //         {
    //             isPremium: false,
    //             goldAmount: 8,
    //             tokenAmount: 0.04,
    //             type: ProductType.Crop,
    //             crop: watermelon,
    //         },
    //     ]

    //     await queryRunner.manager.save(ProductEntity, data)

    //     //Update crop and animal with products
    //     carrot.product = data.find(product => product.crop?.id?.toString() === CropKey.Carrot) as ProductEntity
    //     potato.product = data.find(product => product.crop?.id?.toString() === CropKey.Potato) as ProductEntity
    //     bellPepper.product = data.find(product => product.crop?.id?.toString() === CropKey.BellPepper) as ProductEntity
    //     cucumber.product = data.find(product => product.crop?.id?.toString() === CropKey.Cucumber) as ProductEntity
    //     pineapple.product = data.find(product => product.crop?.id?.toString() === CropKey.Pineapple) as ProductEntity
    //     watermelon.product = data.find(product => product.crop?.id?.toString() === CropKey.Watermelon) as ProductEntity
    //     chicken.product = data.find(product => product.animal?.id?.toString() === AnimalKey.Chicken) as ProductEntity
    //     cow.product = data.find(product => product.animal?.id?.toString() === AnimalKey.Cow) as ProductEntity

    //     //Save updated crop and animal
    //     await queryRunner.manager.save(CropEntity, [carrot, potato, bellPepper, cucumber, pineapple, watermelon])
    // }

    private async seedBuildingData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<BuildingEntity>> = [
            {
                id: BuildingKey.Coop,
                availableInShop: true,
                type: AnimalType.Poultry,
                maxUpgrade: 2,
                price: 2000,
                upgrades: [
                    { id: UpgradeKey.Coop_Upgrade1, upgradePrice: 0, capacity: 3 },
                    { id: UpgradeKey.Coop_Upgrade2, upgradePrice: 1000, capacity: 5 },
                    { id: UpgradeKey.Coop_Upgrade3, upgradePrice: 2000, capacity: 10 }
                ]
            },
            {
                id: BuildingKey.Pasture,
                availableInShop: true,
                type: AnimalType.Livestock,
                maxUpgrade: 2,
                price: 3000,
                upgrades: [
                    { id: UpgradeKey.Pasture_Upgrade1, upgradePrice: 0, capacity: 3 },
                    { id: UpgradeKey.Pasture_Upgrade2, upgradePrice: 1000, capacity: 5 },
                    { id: UpgradeKey.Pasture_Upgrade3, upgradePrice: 2000, capacity: 10 }
                ]
            },
            {
                id: BuildingKey.Home,
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
            { id: ToolKey.Scythe, availableIn: AvailableInType.Home, index: 0 },
            { id: ToolKey.Steal, availableIn: AvailableInType.Neighbor, index: 1 },
            { id: ToolKey.WaterCan, availableIn: AvailableInType.Both, index: 2 },
            { id: ToolKey.Herbicide, availableIn: AvailableInType.Both, index: 3 },
            { id: ToolKey.Pesticide, availableIn: AvailableInType.Both, index: 4 }
        ]
        await queryRunner.manager.save(ToolEntity, data)
    }
    private async seedTileData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<TileEntity>> = [
            {
                id: TileKey.StarterTile,
                price: 0,
                maxOwnership: 6,
                isNFT: false,
                availableInShop: true
            },
            {
                id: TileKey.BasicTile1,
                price: 1000,
                maxOwnership: 10,
                isNFT: false,
                availableInShop: true
            },
            {
                id: TileKey.BasicTile2,
                price: 2500,
                maxOwnership: 30,
                isNFT: false,
                availableInShop: true
            },
            {
                id: TileKey.BasicTile3,
                price: 10000,
                maxOwnership: 9999,
                isNFT: false,
                availableInShop: true
            },
            {
                id: TileKey.FertileTile,
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
                id: SupplyKey.BasicFertilizer,
                type: SupplyType.AnimalFeed,
                price: 50,
                availableInShop: true,
                fertilizerEffectTimeReduce: 60 * 30,
                maxStack: 16
            },
            {
                id: SupplyKey.AnimalFeed,
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
                id: DailyRewardKey.Day1,
                amount: 100,
                day: 1,
                isLastDay: false
            },
            {
                id: DailyRewardKey.Day2,
                amount: 200,
                day: 2,
                isLastDay: false
            },
            {
                id: DailyRewardKey.Day3,
                amount: 300,
                day: 3,
                isLastDay: false
            },
            {
                id: DailyRewardKey.Day4,
                amount: 600,
                day: 4,
                isLastDay: false
            },
            {
                id: DailyRewardKey.Day5,
                day: 5,
                isLastDay: true,
                dailyRewardPossibilities: [
                    {
                        id: DailyRewardPossibilityKey.Possibility1,
                        goldAmount: 1000,
                        thresholdMin: 0,
                        thresholdMax: 0.8,
                        dailyReward: { id: DailyRewardKey.Day5 }
                    },
                    {
                        id: DailyRewardPossibilityKey.Possibility2,
                        goldAmount: 1500,
                        thresholdMin: 0.8,
                        thresholdMax: 0.9,
                        dailyReward: { id: DailyRewardKey.Day5 }
                    },
                    {
                        id: DailyRewardPossibilityKey.Possibility3,
                        goldAmount: 2000,
                        thresholdMin: 0.9,
                        thresholdMax: 0.95,
                        dailyReward: { id: DailyRewardKey.Day5 }
                    },
                    {
                        id: DailyRewardPossibilityKey.Possibility4,
                        tokenAmount: 3,
                        thresholdMin: 0.95,
                        thresholdMax: 0.99,
                        dailyReward: { id: DailyRewardKey.Day5 }
                    },
                    {
                        id: DailyRewardPossibilityKey.Possibility5,
                        tokenAmount: 10,
                        thresholdMin: 0.99,
                        thresholdMax: 1,
                        dailyReward: { id: DailyRewardKey.Day5 }
                    }
                ]
            }
        ]

        await queryRunner.manager.save(DailyRewardEntity, data)
    }
    private async seedSpinData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<SpinEntity>> = [
            {
                id: SpinKey.Gold1,
                type: SpinType.Gold,
                goldAmount: 100,
                thresholdMin: 0,
                thresholdMax: 0.2
            },
            {
                id: SpinKey.Gold2,
                type: SpinType.Gold,
                goldAmount: 250,
                thresholdMin: 0.2,
                thresholdMax: 0.35
            },
            {
                id: SpinKey.Gold3,
                type: SpinType.Gold,
                goldAmount: 500,
                thresholdMin: 0.35,
                thresholdMax: 0.45
            },
            {
                id: SpinKey.Gold4,
                type: SpinType.Gold,
                goldAmount: 200,
                thresholdMin: 0.45,
                thresholdMax: 0.5
            },
            {
                id: SpinKey.Seed1,
                type: SpinType.Seed,
                quantity: 2,
                thresholdMin: 0.5,
                thresholdMax: 0.65
            },
            {
                id: SpinKey.Seed2,
                type: SpinType.Seed,
                quantity: 2,
                thresholdMin: 0.65,
                thresholdMax: 0.8
            },
            {
                id: SpinKey.BasicFertilizer,
                type: SpinType.Supply,
                quantity: 4,
                thresholdMin: 0.8,
                thresholdMax: 0.99
            },
            {
                id: SpinKey.Token,
                type: SpinType.Token,
                tokenAmount: 15,
                thresholdMin: 0.99,
                thresholdMax: 1
            }
        ]

        await queryRunner.manager.save(SpinEntity, data)
    }
}

import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { REDIS_KEY } from "@src/constants"
import { AnimalEntity, AnimalKey, AnimalType, AvailableInType, BuildingEntity, BuildingKey, CropEntity, CropKey, DailyRewardEntity, DailyRewardKey, DailyRewardPossibility, MarketPricingEntity, MarketPricingType, SpinEntity, SpinKey, SpinType, SupplyEntity, SupplyKey, SupplyType, TileEntity, TileKey, ToolEntity, ToolKey, UpgradeEntity } from "@src/database"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"

@Injectable()
export class SeedDataService implements OnModuleInit {
    private readonly logger = new Logger(SeedDataService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,    
    ) {}

    async onModuleInit() {
        await this.clearPostgresData()
        await this.clearRedisCacheData()
        await this.seedData()
        await this.saveDataToRedis()
    }

    async clearRedisCacheData() {
        this.logger.log("Clearing cache data started")
    
        try {
            await this.cacheManager.reset()
            this.logger.log("Cache data cleared successfully")
        } catch (error) {
            this.logger.error(`Failed to clear cache data: ${error.message}`)
            throw error
        }
    }

    async saveDataToRedis() {
        this.logger.log("Saving data to Redis started")
        try {
            // Fetch each type of data from the database concurrently
            const [animals, crops, buildings, tools, tiles, supplies, dailyRewards, spins, marketPricings] = await Promise.all([
                this.dataSource.manager.find(AnimalEntity),
                this.dataSource.manager.find(CropEntity),
                this.dataSource.manager.find(BuildingEntity),
                this.dataSource.manager.find(ToolEntity),
                this.dataSource.manager.find(TileEntity),
                this.dataSource.manager.find(SupplyEntity),
                this.dataSource.manager.find(DailyRewardEntity),
                this.dataSource.manager.find(SpinEntity),
                this.dataSource.manager.find(MarketPricingEntity),
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
                this.cacheManager.set(REDIS_KEY.MARKET_PRICINGS, marketPricings),
            ])
    
            this.logger.log("Data saved to Redis successfully")
        } catch (error) {
            this.logger.error(`Failed to save data to Redis: ${error.message}`)
            throw error
        }
    }
    
    async clearPostgresData() {
        this.logger.log("Clearing old data started")
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
    
        try {
            await queryRunner.startTransaction()
    
            // Delete marketplace pricing
            await Promise.all([
                queryRunner.manager.createQueryBuilder()
                    .delete()
                    .from(MarketPricingEntity)
                    .where("animal_id IS NOT NULL")
                    .execute(),
                queryRunner.manager.createQueryBuilder()
                    .delete()
                    .from(MarketPricingEntity)
                    .where("crop_id IS NOT NULL")
                    .execute()
            ])

            // Delete all data concurrently
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
    
    async seedData() {
        this.logger.log("Seeding data started")
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
    
        try {
            await queryRunner.startTransaction()
    
            // Seed data concurrently
            await Promise.all([
                this.seedAnimalData(queryRunner),
                this.seedCropData(queryRunner),
                this.seedBuildingData(queryRunner),
                this.seedToolData(queryRunner),
                this.seedTileData(queryRunner),
                this.seedSupplyData(queryRunner),
                this.seedDailyRewardData(queryRunner),
                this.seedSpinData(queryRunner),
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
    

    async seedAnimalData(queryRunner) {
        const chicken = queryRunner.manager.create(AnimalEntity, {
            key: AnimalKey.Chicken,
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
        })
        await queryRunner.manager.save(chicken)
        chicken.marketPricing = await this.seedMarketPricing(queryRunner, AnimalKey.Chicken, 8, 0.04, MarketPricingType.Animal, chicken)
        await queryRunner.manager.save(chicken)
    
        // Create Cow
        const cow = queryRunner.manager.create(AnimalEntity, {
            key: AnimalKey.Cow,
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
        })
        await queryRunner.manager.save(cow)
        cow.marketPricing = await this.seedMarketPricing(queryRunner, AnimalKey.Cow, 8, 0.04, MarketPricingType.Animal, cow)
        await queryRunner.manager.save(cow)
    }

    async seedCropData(queryRunner) {
        const cropsData = [
            { key: CropKey.Carrot, price: 50, growthStageDuration: 3600, growthStages: 5, basicHarvestExperiences: 12, premiumHarvestExperiences: 60, minHarvestQuantity: 14, maxHarvestQuantity: 20, premium: false, perennial: false, nextGrowthStageAfterHarvest: 1, availableInShop: true, maxStack: 16 },
            { key: CropKey.Potato, price: 100, growthStageDuration: 9000, growthStages: 5, basicHarvestExperiences: 21, premiumHarvestExperiences: 110, minHarvestQuantity: 16, maxHarvestQuantity: 23, premium: false, perennial: false, nextGrowthStageAfterHarvest: 1, availableInShop: true, maxStack: 16 },
            { key: CropKey.Cucumber, price: 100, growthStageDuration: 9000, growthStages: 5, basicHarvestExperiences: 21, premiumHarvestExperiences: 110, minHarvestQuantity: 16, maxHarvestQuantity: 23, premium: false, perennial: false, nextGrowthStageAfterHarvest: 1, availableInShop: true, maxStack: 16 },
            { key: CropKey.Pineapple, price: 100, growthStageDuration: 9000, growthStages: 5, basicHarvestExperiences: 21, premiumHarvestExperiences: 110, minHarvestQuantity: 16, maxHarvestQuantity: 23, premium: false, perennial: false, nextGrowthStageAfterHarvest: 1, availableInShop: true, maxStack: 16 },
            { key: CropKey.Watermelon, price: 100, growthStageDuration: 9000, growthStages: 5, basicHarvestExperiences: 21, premiumHarvestExperiences: 110, minHarvestQuantity: 16, maxHarvestQuantity: 23, premium: false, perennial: false, nextGrowthStageAfterHarvest: 1, availableInShop: true, maxStack: 16 },
            { key: CropKey.BellPepper, price: 100, growthStageDuration: 9000, growthStages: 5, basicHarvestExperiences: 21, premiumHarvestExperiences: 110, minHarvestQuantity: 16, maxHarvestQuantity: 23, premium: false, perennial: false, nextGrowthStageAfterHarvest: 1, availableInShop: true, maxStack: 16 }
        ]
        const cropsMarketPricing = [
            { key: CropKey.Carrot, basicAmount: 4, premiumAmount: 0.02 },
            { key: CropKey.Potato, basicAmount: 8, premiumAmount: 0.04 },
            { key: CropKey.BellPepper, basicAmount: 8, premiumAmount: 0.04 },
            { key: CropKey.Cucumber, basicAmount: 8, premiumAmount: 0.04 },
            { key: CropKey.Pineapple, basicAmount: 8, premiumAmount: 0.04 },
            { key: CropKey.Watermelon, basicAmount: 8, premiumAmount: 0.04 },
        ]
    
        for (let i = 0; i < cropsData.length; i++) {
            const cropData = cropsData[i]
            const pricingData = cropsMarketPricing.find(pricing => pricing.key === cropData.key)
    
            const crop = queryRunner.manager.create(CropEntity, cropData)
            await queryRunner.manager.save(crop)
    
            const marketPricing = await this.seedMarketPricing(
                queryRunner,
                cropData.key,
                pricingData.basicAmount,
                pricingData.premiumAmount,
                MarketPricingType.Crop,
                crop
            )
    
            crop.marketPricing = marketPricing
            await queryRunner.manager.save(crop)
        }
    }
    

    async seedMarketPricing(queryRunner, key, basicAmount, premiumAmount, type, entity = null) {
        const marketPricing = queryRunner.manager.create(MarketPricingEntity, {
            basicAmount,
            premiumAmount,
            type,
            animalId: type === MarketPricingType.Animal && entity ? entity.id : null,
            cropId: type === MarketPricingType.Crop && entity ? entity.id : null,
        })
        return await queryRunner.manager.save(marketPricing)
    }

    async seedBuildingData(queryRunner) {
        // Define building data
        const buildingsData = [
            {
                key: BuildingKey.Coop,
                availableInShop: true,
                type: AnimalType.Poultry,
                maxUpgrade: 2,
                price: 2000,
                upgrades: [
                    { upgradePrice: 0, capacity: 3 },
                    { upgradePrice: 1000, capacity: 5 },
                    { upgradePrice: 2000, capacity: 10 }
                ]
            },
            {
                key: BuildingKey.Pasture,
                availableInShop: true,
                type: AnimalType.Livestock,
                maxUpgrade: 2,
                price: 3000,
                upgrades: [
                    { upgradePrice: 0, capacity: 3 },
                    { upgradePrice: 1000, capacity: 5 },
                    { upgradePrice: 2000, capacity: 10 }
                ]
            },
            {
                key: BuildingKey.Home,
                availableInShop: false,
                maxUpgrade: 0,
                price: 0,
                upgrades: []
            }
        ]
    
        // Iterate over buildingsData to create each building and its upgrades
        for (const buildingData of buildingsData) {
            // Save the building
            const building = queryRunner.manager.create(BuildingEntity, {
                key: buildingData.key,
                availableInShop: buildingData.availableInShop,
                type: buildingData.type,
                maxUpgrade: buildingData.maxUpgrade,
                price: buildingData.price
            })
            await queryRunner.manager.save(building)
    
            // Save each upgrade for the building
            for (const upgradeData of buildingData.upgrades) {
                const upgrade = queryRunner.manager.create(UpgradeEntity, {
                    upgradePrice: upgradeData.upgradePrice,
                    capacity: upgradeData.capacity,
                    building: building
                })
                await queryRunner.manager.save(upgrade)
            }
        }
    }
    

    async seedToolData(queryRunner) {
        const toolsData = [
            { key: ToolKey.Scythe, availableIn: AvailableInType.Home, index: 0 },
            { key: ToolKey.Steal, availableIn: AvailableInType.Neighbor, index: 1 },
            { key: ToolKey.WaterCan, availableIn: AvailableInType.Both, index: 2 },
            { key: ToolKey.Herbicide, availableIn: AvailableInType.Both, index: 3 },
            { key: ToolKey.Pesticide, availableIn: AvailableInType.Both, index: 4 },
        ]

        for (const toolData of toolsData) {
            const tool = queryRunner.manager.create(ToolEntity, toolData)
            await queryRunner.manager.save(tool)
        }
    }



    async seedTileData(queryRunner) {
        const tilesData = [
            { key: TileKey.StarterTile, price: 0, maxOwnership: 6, isNFT: false, availableInShop: true },
            { key: TileKey.BasicTile1, price: 1000, maxOwnership: 10, isNFT: false, availableInShop: true },
            { key: TileKey.BasicTile2, price: 2500, maxOwnership: 30, isNFT: false, availableInShop: true },
            { key: TileKey.BasicTile3, price: 10000, maxOwnership: 9999, isNFT: false, availableInShop: true },
            { key: TileKey.FertileTile, price: 0, maxOwnership: 0, isNFT: true, availableInShop: false },
        ]
    
        for (const tileData of tilesData) {
            const tile = queryRunner.manager.create(TileEntity, tileData)
            await queryRunner.manager.save(tile)
        }
    }

    async seedSupplyData(queryRunner) {
        const suppliesData = [
            {
                key: SupplyKey.BasicFertilizer,
                type: SupplyType.AnimalFeed,
                price: 50,
                availableInShop: true,
                fertilizerEffectTimeReduce: 60 * 30,
            },
            {
                key: SupplyKey.AnimalFeed,
                type: SupplyType.AnimalFeed,
                price: 50,
                availableInShop: true,
            },
        ]
    
        for (const supplyData of suppliesData) {
            const supply = queryRunner.manager.create(SupplyEntity, supplyData)
            await queryRunner.manager.save(supply)
        }
    }

    async seedDailyRewardData(queryRunner) {
        const dailyRewardsData = [
            {
                key: DailyRewardKey.Day1,
                amount: 100,
                day: 1,
                isLastDay: false,
                dailyRewardPossibilities: [],
            },
            {
                key: DailyRewardKey.Day2,
                amount: 200,
                day: 2,
                isLastDay: false,
                dailyRewardPossibilities: [],
            },
            {
                key: DailyRewardKey.Day3,
                amount: 300,
                day: 3,
                isLastDay: false,
                dailyRewardPossibilities: [],
            },
            {
                key: DailyRewardKey.Day4,
                amount: 600,
                day: 4,
                isLastDay: false,
                dailyRewardPossibilities: [],
            },
            {
                key: DailyRewardKey.Day5,
                day: 5,
                isLastDay: true,
                dailyRewardPossibilities: [
                    { goldAmount: 1000, thresholdMin: 0, thresholdMax: 0.8 },
                    { goldAmount: 1500, thresholdMin: 0.8, thresholdMax: 0.9 },
                    { goldAmount: 2000, thresholdMin: 0.9, thresholdMax: 0.95 },
                    { tokenAmount: 3, thresholdMin: 0.95, thresholdMax: 0.99 },
                    { tokenAmount: 10, thresholdMin: 0.99, thresholdMax: 1 },
                ],
            },
        ]
    
        for (const rewardData of dailyRewardsData) {
            const { dailyRewardPossibilities, ...rewardInfo } = rewardData
            const reward = queryRunner.manager.create(DailyRewardEntity, rewardInfo)
            await queryRunner.manager.save(reward)
    
            if (reward.isLastDay && dailyRewardPossibilities) {
                for (const possibilityData of dailyRewardPossibilities) {
                    const possibility = queryRunner.manager.create(DailyRewardPossibility, {
                        ...possibilityData,
                        dailyReward: reward,
                    })
                    await queryRunner.manager.save(possibility)
                }
            }
        }
    }
    async seedSpinData(queryRunner) {
        const spinsData = [
            {key: SpinKey.Gold1,type: SpinType.Gold, goldAmount: 100, thresholdMin: 0, thresholdMax: 0.2 },
            {key: SpinKey.Gold2,type: SpinType.Gold, goldAmount: 250, thresholdMin: 0.2, thresholdMax: 0.35 },
            {key: SpinKey.Gold3,type: SpinType.Gold, goldAmount: 500, thresholdMin: 0.35, thresholdMax: 0.45 },
            {key: SpinKey.Gold4,type: SpinType.Gold, goldAmount: 200, thresholdMin: 0.45, thresholdMax: 0.5 },
            {key: SpinKey.Seed1,type: SpinType.Seed, quantity: 2, thresholdMin: 0.5, thresholdMax: 0.65 },
            {key: SpinKey.Seed2,type: SpinType.Seed, quantity: 2, thresholdMin: 0.65, thresholdMax: 0.8 },
            {key: SpinKey.BasicFertilizer,type: SpinType.Supply, quantity: 4, thresholdMin: 0.8, thresholdMax: 0.99 },
            {key: SpinKey.Token,type: SpinType.Token, tokenAmount: 15, thresholdMin: 0.99, thresholdMax: 1 },
        ]
    
        for (const spinData of spinsData) {
            const spin = queryRunner.manager.create(SpinEntity, spinData)
            await queryRunner.manager.save(spin)
        }
    }
}

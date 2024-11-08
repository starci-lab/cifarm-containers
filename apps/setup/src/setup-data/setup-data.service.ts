import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AnimalEntity, BuildingEntity, CropEntity, DailyRewardEntity,  DailyRewardPossibility,  MarketPricingEntity, PlacedItemEntity, SpinEntity, SpinType, SupplyEntity, SupplyType, TileEntity, TileKeyType, ToolEntity, UpgradeEntity } from "@src/database";
import { AnimalType, ToolType, AvailableInType, BuildingKeyType, MarketPricingType } from '@src/database';

@Injectable()
export class SetupDataService implements OnModuleInit {
    private readonly logger = new Logger(SetupDataService.name);

    constructor(private readonly dataSource: DataSource) {}

    async onModuleInit() {
        await this.clearData();
        await this.seedData();
    }

    async clearData() {
        this.logger.log("Clearing old data started");

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            await queryRunner.startTransaction();

            await queryRunner.manager.delete(AnimalEntity, {});
            await queryRunner.manager.delete(UpgradeEntity, {});
            await queryRunner.manager.delete(BuildingEntity, {});
            await queryRunner.manager.delete(CropEntity, {});
            await queryRunner.manager.delete(ToolEntity, {});
            await queryRunner.manager.delete(PlacedItemEntity, {});
            await queryRunner.manager.delete(MarketPricingEntity, {});
            await queryRunner.manager.delete(TileEntity, {});
            await queryRunner.manager.delete(SupplyEntity, {});
            await queryRunner.manager.delete(DailyRewardPossibility, {});
            await queryRunner.manager.delete(DailyRewardEntity, {});
            await queryRunner.manager.delete(SpinEntity, {});

            await queryRunner.commitTransaction();
            this.logger.log("Clearing old data finished");
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error("Error clearing data:", error);
        } finally {
            await queryRunner.release();
        }
    }

    async seedData() {
        this.logger.log("Seeding data started");

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            await queryRunner.startTransaction();

            await this.seedAnimalData(queryRunner);
            await this.seedCropData(queryRunner);
            await this.seedBuildingData(queryRunner);
            await this.seedToolData(queryRunner);
            await this.seedPlacedItemData(queryRunner);
            await this.seedTileData(queryRunner);
            await this.seedSupplyData(queryRunner);
            await this.seedDailyRewardData(queryRunner);
            await this.seedSpinData(queryRunner);

            await queryRunner.commitTransaction();
            this.logger.log("Seeding data finished");
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error("Error seeding data:", error);
        } finally {
            await queryRunner.release();
        }
    }

    async seedAnimalData(queryRunner) {

        let animalMarketPricingChicken = await queryRunner.manager.save(
            queryRunner.manager.create(MarketPricingEntity, {
                basicAmount: 100.0,
                premiumAmount: 200.0,
                type: MarketPricingType.Animal,
            }))

        let animalMarketPricingCow = await queryRunner.manager.save(
            queryRunner.manager.create(MarketPricingEntity, {
                basicAmount: 100.0,
                premiumAmount: 200.0,
                type: MarketPricingType.Animal,
            }))

        // Define and save animals
        const chicken = queryRunner.manager.create(AnimalEntity, {
            yieldTime: 60 * 60 * 24, // 1 day in seconds
            offspringPrice: 1000,
            isNFT: false,
            growthTime: 60 * 60 * 24 * 3, // 3 days in seconds
            availableInShop: true,
            hungerTime: 60 * 60 * 12, // 12 hours in seconds
            minHarvestQuantity: 14,
            maxHarvestQuantity: 20,
            basicHarvestExperiences: 32,
            premiumHarvestExperiences: 96,
            type: AnimalType.Poultry,
            sickChance: 0.001,
            marketPricing: animalMarketPricingChicken,
        });
        await queryRunner.manager.save(chicken);

        const cow = queryRunner.manager.create(AnimalEntity, {
            yieldTime: 60 * 60 * 24 * 2, // 2 days in seconds
            offspringPrice: 2500,
            isNFT: false,
            growthTime: 60 * 60 * 24 * 7, // 7 days in seconds
            availableInShop: true,
            hungerTime: 60 * 60 * 12, // 12 hours in seconds
            minHarvestQuantity: 14,
            maxHarvestQuantity: 20,
            basicHarvestExperiences: 32,
            premiumHarvestExperiences: 96,
            type: AnimalType.Livestock,
            sickChance: 0.001,
            marketPricing: animalMarketPricingCow,
        });
        await queryRunner.manager.save(cow);
    }

    async seedCropData(queryRunner) {
        let cropMarketPricing = await queryRunner.manager.save(
            queryRunner.manager.create(MarketPricingEntity, {
                basicAmount: 50.0,
                premiumAmount: 120.0,
                type: MarketPricingType.Crop,
            })
        );
        const crop = queryRunner.manager.create(CropEntity, {
            growthStageDuration: 300,
            growthStages: 4,
            price: 100,
            premium: true,
            perennial: false,
            nextGrowthStageAfterHarvest: 1,
            minHarvestQuantity: 2,
            maxHarvestQuantity: 5,
            basicHarvestExperiences: 10,
            premiumHarvestExperiences: 25,
            availableInShop: true,
            marketPricing: cropMarketPricing
        });
        await queryRunner.manager.save(crop);
    }

    async seedBuildingData(queryRunner) {
        const building = queryRunner.manager.create(BuildingEntity, {
            buildingKey: BuildingKeyType.Coop,
            availableInShop: true,
            type: AnimalType.Poultry,
            maxUpgrade: 3,
            price: 500.0,
        });
        await queryRunner.manager.save(building);

        const upgrade = queryRunner.manager.create(UpgradeEntity, {
            upgradePrice: 200,
            capacity: 10,
            building: building
        });
        await queryRunner.manager.save(upgrade);
    }

    async seedToolData(queryRunner) {
        const toolsData = [
            { type: ToolType.Scythe, availableIn: AvailableInType.Home, index: 0 },
            { type: ToolType.Steal, availableIn: AvailableInType.Neighbor, index: 1 },
            { type: ToolType.WaterCan, availableIn: AvailableInType.Both, index: 2 },
            { type: ToolType.Herbicide, availableIn: AvailableInType.Both, index: 3 },
            { type: ToolType.Pesticide, availableIn: AvailableInType.Both, index: 4 },
        ];

        for (const toolData of toolsData) {
            const tool = queryRunner.manager.create(ToolEntity, toolData);
            await queryRunner.manager.save(tool);
        }
    }

    async seedPlacedItemData(queryRunner) {
        const placedItem = queryRunner.manager.create(PlacedItemEntity, {
            quantity: '5'
        });
        await queryRunner.manager.save(placedItem);
    }

    async seedTileData(queryRunner) {
        const tilesData = [
            { type: TileKeyType.StarterTile, price: 0, maxOwnership: 6, isNFT: false, availableInShop: true },
            { type: TileKeyType.BasicTile1, price: 1000, maxOwnership: 10, isNFT: false, availableInShop: true },
            { type: TileKeyType.BasicTile2, price: 2500, maxOwnership: 30, isNFT: false, availableInShop: true },
            { type: TileKeyType.BasicTile3, price: 10000, maxOwnership: 9999, isNFT: false, availableInShop: true },
            { type: TileKeyType.FertileTile, price: 0, maxOwnership: 0, isNFT: true, availableInShop: false },
        ];
    
        for (const tileData of tilesData) {
            const tile = queryRunner.manager.create(TileEntity, tileData);
            await queryRunner.manager.save(tile);
        }
    }

    async seedSupplyData(queryRunner) {
        const suppliesData = [
            {
                type: SupplyType.BasicFertilizer,
                price: 50,
                availableInShop: true,
                fertilizerEffectTimeReduce: 60 * 30,
            },
            {
                type: SupplyType.AnimalFeed,
                price: 50,
                availableInShop: true,
            },
        ];
    
        for (const supplyData of suppliesData) {
            const supply = queryRunner.manager.create(SupplyEntity, supplyData);
            await queryRunner.manager.save(supply);
        }
    }

    async seedDailyRewardData(queryRunner) {
        const dailyRewardsData = [
            {
                amount: 100,
                day: 1,
                isLastDay: false,
                dailyRewardPossibilities: [],
            },
            {
                amount: 200,
                day: 2,
                isLastDay: false,
                dailyRewardPossibilities: [],
            },
            {
                amount: 300,
                day: 3,
                isLastDay: false,
                dailyRewardPossibilities: [],
            },
            {
                amount: 600,
                day: 4,
                isLastDay: false,
                dailyRewardPossibilities: [],
            },
            {
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
        ];
    
        for (const rewardData of dailyRewardsData) {
            const { dailyRewardPossibilities, ...rewardInfo } = rewardData;
            const reward = queryRunner.manager.create(DailyRewardEntity, rewardInfo);
            await queryRunner.manager.save(reward);
    
            if (reward.isLastDay && dailyRewardPossibilities) {
                for (const possibilityData of dailyRewardPossibilities) {
                    const possibility = queryRunner.manager.create(DailyRewardPossibility, {
                        ...possibilityData,
                        dailyReward: reward,
                    });
                    await queryRunner.manager.save(possibility);
                }
            }
        }
    }
    async seedSpinData(queryRunner) {
        const spinsData = [
            {type: SpinType.Gold, goldAmount: 100, thresholdMin: 0, thresholdMax: 0.2 },
            {type: SpinType.Gold, goldAmount: 250, thresholdMin: 0.2, thresholdMax: 0.35 },
            {type: SpinType.Gold, goldAmount: 500, thresholdMin: 0.35, thresholdMax: 0.45 },
            {type: SpinType.Gold, goldAmount: 200, thresholdMin: 0.45, thresholdMax: 0.5 },
            {type: SpinType.Seed, quantity: 2, thresholdMin: 0.5, thresholdMax: 0.65 },
            {type: SpinType.Seed, quantity: 2, thresholdMin: 0.65, thresholdMax: 0.8 },
            {type: SpinType.Supply, quantity: 4, thresholdMin: 0.8, thresholdMax: 0.99 },
            {type: SpinType.Token, tokenAmount: 15, thresholdMin: 0.99, thresholdMax: 1 },
        ];
    
        for (const spinData of spinsData) {
            const spin = queryRunner.manager.create(SpinEntity, spinData);
            await queryRunner.manager.save(spin);
        }
    }
    
    
    
}

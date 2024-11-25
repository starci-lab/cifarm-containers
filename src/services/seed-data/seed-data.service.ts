import { Injectable, Logger } from "@nestjs/common"
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
    InventoryType,
    InventoryTypeEntity,
    InventoryTypeId,
    PlacedItemType,
    PlacedItemTypeId,
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
import { DataSource, DeepPartial, QueryRunner } from "typeorm"

@Injectable()
export class SeedDataService {
    private readonly logger = new Logger(SeedDataService.name)

    constructor() {}

    public async seedStaticData(dataSource: DataSource) {
        this.logger.log("Starting static data seeding...")

        try {
            await this.clearData(dataSource)
            await this.seedEntities(dataSource)
            this.logger.log("Static data seeding completed successfully.")
        } catch (error) {
            this.logger.error("An error occurred during static data seeding:", error)
            throw error
        }
    }
    private async clearData(dataSource: DataSource) {
        this.logger.log("Clearing old data started")
        const queryRunner: QueryRunner = dataSource.createQueryRunner()
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
                queryRunner.manager.delete(SystemEntity, {}),
                queryRunner.manager.delete(InventoryTypeEntity, {})
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
    private async seedEntities(dataSource: DataSource) {
        this.logger.log("Seeding entities...")

        try {
            const queryRunner = dataSource.createQueryRunner()
            await queryRunner.connect()

            try {
                await queryRunner.startTransaction()

                // Sequential or parallel calls to seeding methods
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
                this.logger.log("Entities seeded successfully.")
            } catch (error) {
                await queryRunner.rollbackTransaction()
                this.logger.error("Error occurred while seeding entities:", error)
                throw error
            } finally {
                await queryRunner.release()
            }
        } catch (error) {
            this.logger.error("Error occurred during entity seeding:", error)
            throw error
        }
    }
    private async seedSystemData(queryRunner: QueryRunner) {
        const activities: Activities = {
            cureAnimal: {
                energyConsume: 1,
                experiencesGain: 3
            },
            feedAnimal: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpCureAnimal: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpUseHerbicide: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpUsePestiside: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpWater: {
                energyConsume: 1,
                experiencesGain: 3
            },
            thiefAnimalProduct: {
                energyConsume: 1,
                experiencesGain: 3
            },
            thiefCrop: {
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
            usePestiside: {
                energyConsume: 1,
                experiencesGain: 3
            },
            water: {
                energyConsume: 1,
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
                price: 1000,
                type: AnimalType.Poultry,
                sickChance: 0.001,
                product: {
                    id: ProductId.Egg,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Animal,
                    inventoryType: {
                        id: ProductId.Egg,
                        asTool: false,
                        deliverable: false,
                        maxStack: 1,
                        placeable: true,
                        type: InventoryType.Product
                    }
                },
                inventoryType: {
                    id: AnimalId.Chicken,
                    asTool: false,
                    deliverable: false,
                    maxStack: 1,
                    placeable: true,
                    type: InventoryType.Animal
                },
                placedItemType: {
                    id: PlacedItemTypeId.Chicken,
                    type: PlacedItemType.Animal
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
                price: 2500,
                type: AnimalType.Livestock,
                sickChance: 0.001,
                product: {
                    id: ProductId.Milk,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Animal,
                    inventoryType: {
                        id: ProductId.Milk,
                        asTool: false,
                        deliverable: false,
                        maxStack: 1,
                        placeable: true,
                        type: InventoryType.Product
                    }
                },
                inventoryType: {
                    id: AnimalId.Cow,
                    asTool: false,
                    deliverable: false,
                    maxStack: 1,
                    placeable: true,
                    type: InventoryType.Animal
                },
                placedItemType: {
                    id: PlacedItemTypeId.Cow,
                    type: PlacedItemType.Animal
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
                perennialCount: 1,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.Carrot,
                    isPremium: false,
                    goldAmount: 4,
                    tokenAmount: 0.02,
                    type: ProductType.Crop,
                    inventoryType: {
                        id: ProductId.Carrot,
                        asTool: false,
                        deliverable: true,
                        maxStack: 16,
                        placeable: false,
                        type: InventoryType.Product
                    }
                },
                inventoryType: {
                    id: InventoryTypeId.CarrotSeed,
                    asTool: false,
                    deliverable: false,
                    maxStack: 16,
                    placeable: false,
                    type: InventoryType.Seed
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
                perennialCount: 1,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.Potato,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Crop,
                    inventoryType: {
                        id: ProductId.Potato,
                        asTool: false,
                        deliverable: true,
                        maxStack: 16,
                        placeable: false,
                        type: InventoryType.Product
                    }
                },
                inventoryType: {
                    id: InventoryTypeId.PotatoSeed,
                    asTool: false,
                    deliverable: false,
                    maxStack: 16,
                    placeable: false,
                    type: InventoryType.Seed
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
                perennialCount: 1,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.Cucumber,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Crop,
                    inventoryType: {
                        id: ProductId.Cucumber,
                        asTool: false,
                        deliverable: true,
                        maxStack: 16,
                        placeable: false,
                        type: InventoryType.Product
                    }
                },
                inventoryType: {
                    id: InventoryTypeId.CucumberSeed,
                    asTool: false,
                    deliverable: false,
                    maxStack: 16,
                    placeable: false,
                    type: InventoryType.Seed
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
                perennialCount: 1,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.Pineapple,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Crop,
                    inventoryType: {
                        id: ProductId.Pineapple,
                        asTool: false,
                        deliverable: true,
                        maxStack: 16,
                        placeable: false,
                        type: InventoryType.Product
                    }
                },
                inventoryType: {
                    id: InventoryTypeId.PineappleSeed,
                    asTool: false,
                    deliverable: false,
                    maxStack: 16,
                    placeable: false,
                    type: InventoryType.Seed
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
                perennialCount: 1,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.Watermelon,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Crop,
                    inventoryType: {
                        id: ProductId.Watermelon,
                        asTool: false,
                        deliverable: true,
                        maxStack: 16,
                        placeable: false,
                        type: InventoryType.Product
                    }
                },
                inventoryType: {
                    id: InventoryTypeId.WatermelonSeed,
                    asTool: false,
                    deliverable: false,
                    maxStack: 16,
                    placeable: false,
                    type: InventoryType.Seed
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
                perennialCount: 3,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
                maxStack: 16,
                product: {
                    id: ProductId.BellPepper,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Crop,
                    inventoryType: {
                        id: ProductId.BellPepper,
                        asTool: false,
                        deliverable: true,
                        maxStack: 16,
                        placeable: false,
                        type: InventoryType.Product
                    }
                },
                inventoryType: {
                    id: InventoryTypeId.BellPepperSeed,
                    asTool: false,
                    deliverable: false,
                    maxStack: 16,
                    placeable: false,
                    type: InventoryType.Seed
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
                ],
                placedItemType: {
                    id: PlacedItemTypeId.Coop,
                    type: PlacedItemType.Building
                }
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
                ],
                placedItemType: {
                    id: PlacedItemTypeId.Pasture,
                    type: PlacedItemType.Building
                }
            },
            {
                id: BuildingId.Home,
                availableInShop: false,
                maxUpgrade: 0,
                price: 0,
                upgrades: [],
                placedItemType: {
                    id: PlacedItemTypeId.Home,
                    type: PlacedItemType.Building
                }
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
                availableInShop: true,
                inventoryType: {
                    id: TileId.StarterTile,
                    asTool: false,
                    deliverable: false,
                    maxStack: 16,
                    placeable: true,
                    type: InventoryType.Tile
                },
                placedItemType: {
                    id: PlacedItemTypeId.StarterTile,
                    type: PlacedItemType.Tile
                }
            },
            {
                id: TileId.BasicTile1,
                price: 1000,
                maxOwnership: 10,
                isNFT: false,
                availableInShop: true,
                inventoryType: {
                    id: TileId.BasicTile1,
                    asTool: false,
                    deliverable: false,
                    maxStack: 16,
                    placeable: true,
                    type: InventoryType.Tile
                },
                placedItemType: {
                    id: PlacedItemTypeId.BasicTile1,
                    type: PlacedItemType.Tile
                }
            },
            {
                id: TileId.BasicTile2,
                price: 2500,
                maxOwnership: 30,
                isNFT: false,
                availableInShop: true,
                inventoryType: {
                    id: TileId.BasicTile2,
                    asTool: false,
                    deliverable: false,
                    maxStack: 16,
                    placeable: true,
                    type: InventoryType.Tile
                },
                placedItemType: {
                    id: PlacedItemTypeId.BasicTile2,
                    type: PlacedItemType.Tile
                }
            },
            {
                id: TileId.BasicTile3,
                price: 10000,
                maxOwnership: 9999,
                isNFT: false,
                availableInShop: true,
                inventoryType: {
                    id: TileId.BasicTile3,
                    asTool: false,
                    deliverable: false,
                    maxStack: 16,
                    placeable: true,
                    type: InventoryType.Tile
                },
                placedItemType: {
                    id: PlacedItemTypeId.BasicTile3,
                    type: PlacedItemType.Tile
                }
            },
            {
                id: TileId.FertileTile,
                price: 0,
                maxOwnership: 0,
                isNFT: true,
                availableInShop: false,
                inventoryType: {
                    id: TileId.FertileTile,
                    asTool: false,
                    deliverable: false,
                    maxStack: 16,
                    placeable: true,
                    type: InventoryType.Tile
                },
                placedItemType: {
                    id: PlacedItemTypeId.FertileTile,
                    type: PlacedItemType.Tile
                }
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
                maxStack: 16,
                inventoryType: {
                    id: SupplyId.BasicFertilizer,
                    asTool: true,
                    deliverable: false,
                    maxStack: 16,
                    placeable: false,
                    type: InventoryType.Supply
                }
            },
            {
                id: SupplyId.AnimalFeed,
                type: SupplyType.AnimalFeed,
                price: 50,
                availableInShop: true,
                maxStack: 16,
                inventoryType: {
                    id: SupplyId.AnimalFeed,
                    asTool: true,
                    deliverable: false,
                    maxStack: 16,
                    placeable: false,
                    type: InventoryType.Supply
                }
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

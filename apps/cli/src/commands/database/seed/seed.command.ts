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
    CropRandomness,
    DailyRewardEntity,
    DailyRewardId,
    InventoryType,
    InventoryTypeEntity,
    InventoryTypeId,
    PlacedItemType,
    PlacedItemTypeId,
    ProductId,
    ProductType,
    AppearanceChance,
    SpinPrizeEntity,
    SpinPrizeType,
    SpinSlotEntity,
    Starter,
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
    UpgradeId,
    SpinInfo,
    GameplayPostgreSQLEntity,
    CliSqliteService,
    AnimalRandomness,
} from "@src/databases"
import { DataSource, DeepPartial, QueryRunner } from "typeorm"
import { CommandRunner, Option, SubCommand } from "nest-commander"
import { gameplayPostgreSqlEntites } from "@src/databases"
import { Logger } from "@nestjs/common"

@SubCommand({ name: "seed", description: "Seed static data into the data source" })
export class SeedCommand extends CommandRunner {
    private readonly logger = new Logger(SeedCommand.name)
    private readonly dataSource: DataSource
    constructor(
        private readonly cliSqliteService: CliSqliteService
    ) {
        super()
        this.dataSource = this.cliSqliteService.getDataSource()
    }

    async run(_: Array<string>, options: SeedCommandOptions): Promise<void> {
        const { force } = options
        
        // get current data source
        const selectedDataSource = await this.dataSource.manager.findOne(GameplayPostgreSQLEntity, {
            where: { selected: true }
        })

        // log selected data source
        this.logger.debug(`Selected data source: ${selectedDataSource?.type}`)

        if (!selectedDataSource) {
            this.logger.error("No data source selected.")
            return
        }
        const { host, password, dbName, port, username } = selectedDataSource

        const dataSource = new DataSource({
            type: "postgres",
            database: dbName,
            host,
            port,
            username,
            password,
            entities: gameplayPostgreSqlEntites(),
            synchronize: true
        })
        await dataSource.initialize()
        try {
            if (force) {
                await this.clearData(dataSource)
            }
            await this.seedEntities(dataSource)
            this.logger.log("Static data seeded successfully.")
        } catch (error) {
            this.logger.error(`Failed to seed static data into the data source.: ${error.message}`)
        } finally {
            await dataSource.destroy()
        }
    }

    @Option({
        flags: "-f, --force",
        description: "Force to delete all data before seeding"
    })
    parseForce(): boolean {
        return true
    }
    private async clearData(dataSource: DataSource) {
        this.logger.debug("Clearing old data...")
        const queryRunner: QueryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()

            await queryRunner.manager.delete(AnimalEntity, {})
            await queryRunner.manager.delete(SpinPrizeEntity, {})
            await queryRunner.manager.delete(CropEntity, {})
            await queryRunner.manager.delete(UpgradeEntity, {})
            await queryRunner.manager.delete(BuildingEntity, {})
            await queryRunner.manager.delete(ToolEntity, {})
            await queryRunner.manager.delete(TileEntity, {})
            await queryRunner.manager.delete(SupplyEntity, {})
            await queryRunner.manager.delete(DailyRewardEntity, {})
            await queryRunner.manager.delete(SystemEntity, {})
            await queryRunner.manager.delete(InventoryTypeEntity, {})

            await queryRunner.commitTransaction()
            this.logger.verbose("Data cleared successfully.")
        } catch (error) {
            await queryRunner.rollbackTransaction()
            this.logger.error(`Failed to clear old data: ${error.message}`)
        } finally {
            await queryRunner.release()
        }
    }

    private async seedEntities(dataSource: DataSource) {
        this.logger.debug("Seeding entities...")
        try {
            const queryRunner = dataSource.createQueryRunner()
            await queryRunner.connect()

            try {
                await queryRunner.startTransaction()

                // Sequential or parallel calls to seeding methods
                await this.seedAnimalData(queryRunner)
                await this.seedCropData(queryRunner)
                await this.seedBuildingData(queryRunner)
                await this.seedToolData(queryRunner)
                await this.seedTileData(queryRunner)
                await this.seedSupplyData(queryRunner)
                await this.seedDailyRewardData(queryRunner)
                await this.seedSystemData(queryRunner)
                await this.seedSpinPrizeData(queryRunner)
                await this.seedSpinSlotData(queryRunner)

                await queryRunner.commitTransaction()
                this.logger.verbose("Entities seeded successfully.")
            } catch (error) {
                await queryRunner.rollbackTransaction()
                this.logger.error(`Failed to seed entities: ${error.message}`)
            } finally {
                await queryRunner.release()
            }
        } catch (error) {
            this.logger.error(`Failed to seed entities: ${error.message}`)
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
            helpUsePesticide: {
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
            usePesticide: {
                energyConsume: 1,
                experiencesGain: 3
            },
            water: {
                energyConsume: 1,
                experiencesGain: 3
            },
            harvestCrop: {
                energyConsume: 1,
                experiencesGain: 3
            }
        }
        const cropRandomness: CropRandomness = {
            needWater: 0.5,
            thief2: 0.8,
            thief3: 0.95,
            isWeedyOrInfested: 1
        }
        const animalRandomness: AnimalRandomness = {
            sickChance: 0.5
        }
        const starter: Starter = {
            golds: 1000,
            positions: {
                home: {
                    x: 4,
                    y: 0
                },
                tiles: [
                    {
                        x: 0,
                        y: -1
                    },
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 0,
                        y: 1
                    },
                    {
                        x: 1,
                        y: -1
                    },
                    {
                        x: 1,
                        y: 0
                    },
                    {
                        x: 1,
                        y: 1
                    }
                ]
            }
        }
        const spinInfo: SpinInfo = {
            appearanceChanceSlots: {
                [AppearanceChance.Common]: {
                    count: 4,
                    thresholdMin: 0,
                    thresholdMax: 0.8
                },
                [AppearanceChance.Uncommon]: {
                    count: 2,
                    thresholdMin: 0.8,
                    thresholdMax: 0.95
                },
                [AppearanceChance.Rare]: {
                    count: 1,
                    thresholdMin: 0.95,
                    thresholdMax: 0.99
                },
                [AppearanceChance.VeryRare]: {
                    count: 1,
                    thresholdMin: 0.99,
                    thresholdMax: 1
                }
            }
        }
        const data: Array<DeepPartial<SystemEntity>> = [
            {
                id: SystemId.Activities,
                value: activities
            },
            {
                id: SystemId.CropRandomness,
                value: cropRandomness
            },
            {
                id: SystemId.AnimalRandomness,
                value: animalRandomness
            },
            {
                id: SystemId.Starter,
                value: starter
            },
            {
                id: SystemId.SpinInfo,
                value: spinInfo
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
                product: {
                    id: ProductId.Egg,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Animal,
                    animalId: AnimalId.Chicken,
                    inventoryType: {
                        id: ProductId.Egg,
                        asTool: false,
                        deliverable: true,
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
                product: {
                    id: ProductId.Milk,
                    isPremium: false,
                    goldAmount: 8,
                    tokenAmount: 0.04,
                    type: ProductType.Animal,
                    animalId: AnimalId.Cow,
                    inventoryType: {
                        id: ProductId.Milk,
                        asTool: false,
                        deliverable: true,
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
                    cropId: CropId.Carrot,
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
                    cropId: CropId.Potato,
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
                    cropId: CropId.Cucumber,
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
                    cropId: CropId.Pineapple,
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
                    cropId: CropId.Watermelon,
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
                    cropId: CropId.BellPepper,
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
                        capacity: 3,
                        upgradeLevel: 1
                    },
                    {
                        id: UpgradeId.CoopUpgrade2,
                        upgradePrice: 1000,
                        capacity: 5,
                        upgradeLevel: 2
                    },
                    {
                        id: UpgradeId.CoopUpgrade3,
                        upgradePrice: 2000,
                        capacity: 10,
                        upgradeLevel: 3
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
                        capacity: 3,
                        upgradeLevel: 1
                    },
                    {
                        id: UpgradeId.PastureUpgrade2,
                        upgradePrice: 1000,
                        capacity: 5,
                        upgradeLevel: 2
                    },
                    {
                        id: UpgradeId.PastureUpgrade3,
                        upgradePrice: 2000,
                        capacity: 10,
                        upgradeLevel: 3
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
                golds: 100,
                day: 1,
                lastDay: false
            },
            {
                id: DailyRewardId.Day2,
                golds: 200,
                day: 2,
                lastDay: false
            },
            {
                id: DailyRewardId.Day3,
                golds: 300,
                day: 3,
                lastDay: false
            },
            {
                id: DailyRewardId.Day4,
                golds: 600,
                day: 4,
                lastDay: false
            },
            {
                id: DailyRewardId.Day5,
                day: 5,
                lastDay: true,
                golds: 1000,
                tokens: 0.25,
            }
        ]

        await queryRunner.manager.save(DailyRewardEntity, data)
    }

    private async seedSpinPrizeData(queryRunner: QueryRunner) {
        const data: Array<DeepPartial<SpinPrizeEntity>> = [
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Common,
                golds: 100,
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Common,
                golds: 200,
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Common,
                golds: 300,
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Uncommon,
                golds: 500,
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Uncommon,
                golds: 1000,
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Rare,
                golds: 2000,
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Common,
                cropId: CropId.Carrot,
                quantity: 3,
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                cropId: CropId.Pineapple,
                quantity: 3,
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                cropId: CropId.Cucumber,
                quantity: 3,
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                cropId: CropId.Potato,
                quantity: 3,
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                cropId: CropId.Watermelon,
                quantity: 3,
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                cropId: CropId.BellPepper,
                quantity: 3,
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.BasicFertilizer,
                quantity: 2,
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.BasicFertilizer,
                quantity: 3,
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.BasicFertilizer,
                quantity: 4,
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.BasicFertilizer,
                quantity: 5,
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.AnimalFeed,
                quantity: 2,
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.AnimalFeed,
                quantity: 3,
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.AnimalFeed,
                quantity: 4,
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.AnimalFeed,
                quantity: 5,
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                tokens: 5,
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                tokens: 10,
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                tokens: 15,
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                tokens: 20,
            }
        ]

        await queryRunner.manager.save(SpinPrizeEntity, data)
    }

    private async seedSpinSlotData(queryRunner: QueryRunner) {
        // get system data
        const { value } = await queryRunner.manager.findOne(SystemEntity, {
            where: {
                id: SystemId.SpinInfo
            }
        })
        const { appearanceChanceSlots } = value as SpinInfo

        const commonPrizes = await queryRunner.manager.find(SpinPrizeEntity, {
            where: {
                appearanceChance: AppearanceChance.Common,
            },
            take: appearanceChanceSlots[AppearanceChance.Common].count
        })
        //get all uncommon prizes
        const uncommonPrizes = await queryRunner.manager.find(SpinPrizeEntity, {
            where: {
                appearanceChance: AppearanceChance.Uncommon
            },
            take: appearanceChanceSlots[AppearanceChance.Uncommon].count
        })
        //get all rare prizes
        const rarePrizes = await queryRunner.manager.find(SpinPrizeEntity, {
            where: {
                appearanceChance: AppearanceChance.Rare
            },
            take: appearanceChanceSlots[AppearanceChance.Rare].count
        })
        //get all very rare prizes
        const veryRarePrizes = await queryRunner.manager.find(SpinPrizeEntity, {
            where: {
                appearanceChance: AppearanceChance.VeryRare
            },
            take: appearanceChanceSlots[AppearanceChance.VeryRare].count
        })
        const data: Array<DeepPartial<SpinSlotEntity>> = [
            ...commonPrizes.map((prize) => ({
                spinPrizeId: prize.id,
            })),
            ...uncommonPrizes.map((prize) => ({
                prize,
                spinPrizeId: prize.id,
            })),
            ...rarePrizes.map((prize) => ({
                prize,
                spinPrizeId: prize.id,
            })),
            ...veryRarePrizes.map((prize) => ({
                prize,
                spinPrizeId: prize.id,
            }))
        ]
        await queryRunner.manager.save(SpinSlotEntity, data)
    }
}

export interface SeedCommandOptions {
    force?: boolean
}



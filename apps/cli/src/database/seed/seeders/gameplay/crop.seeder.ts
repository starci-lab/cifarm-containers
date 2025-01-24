import { Logger } from "@nestjs/common"
import {
    CropEntity,
    CropId,
    InventoryType,
    InventoryTypeId,
    ProductId,
    ProductType
} from "@src/databases"
import { DataSource } from "typeorm"
import { Seeder } from "typeorm-extension"
import { BuildingSeeder } from "./building.seeder"

export class CropSeeder implements Seeder {
    private readonly logger = new Logger(BuildingSeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
        this.logger.debug("Seeding crops...")

        await dataSource.manager.save(CropEntity, [
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
                products: [
                    {
                        id: ProductId.Carrot,
                        isQuality: false,
                        goldAmount: 4,
                        tokenAmount: 0,
                        type: ProductType.Crop,
                        cropId: CropId.Carrot,
                        inventoryType: {
                            id: InventoryTypeId.Carrot,
                            asTool: false,
                            deliverable: true,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    },
                    {
                        id: ProductId.CarrotQuality,
                        isQuality: true,
                        goldAmount: 4,
                        tokenAmount: 0,
                        type: ProductType.Crop,
                        cropId: CropId.Carrot,
                        inventoryType: {
                            id: InventoryTypeId.CarrotQuality,
                            asTool: false,
                            deliverable: false,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    }
                ],
                inventoryType: {
                    id: InventoryTypeId.CarrotSeed,
                    asTool: false,
                    deliverable: false,
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
                products: [
                    {
                        id: ProductId.Potato,
                        isQuality: false,
                        goldAmount: 8,
                        tokenAmount: 0.04,
                        type: ProductType.Crop,
                        cropId: CropId.Potato,
                        inventoryType: {
                            id: InventoryTypeId.Potato,
                            asTool: false,
                            deliverable: true,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    },
                    {
                        id: ProductId.PotatoQuality,
                        isQuality: true,
                        goldAmount: 8,
                        tokenAmount: 0.04,
                        type: ProductType.Crop,
                        cropId: CropId.Potato,
                        inventoryType: {
                            id: InventoryTypeId.PotatoQuality,
                            asTool: false,
                            deliverable: false,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    }
                ],
                inventoryType: {
                    id: InventoryTypeId.PotatoSeed,
                    asTool: false,
                    deliverable: false,
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
                products: [
                    {
                        id: ProductId.Cucumber,
                        isQuality: false,
                        goldAmount: 8,
                        tokenAmount: 0.04,
                        type: ProductType.Crop,
                        cropId: CropId.Cucumber,
                        inventoryType: {
                            id: InventoryTypeId.Cucumber,
                            asTool: false,
                            deliverable: true,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    },
                    {
                        id: ProductId.CucumberQuality,
                        isQuality: true,
                        goldAmount: 8,
                        tokenAmount: 0.04,
                        type: ProductType.Crop,
                        cropId: CropId.Cucumber,
                        inventoryType: {
                            id: InventoryTypeId.CucumberQuality,
                            asTool: false,
                            deliverable: false,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    }
                ],
                inventoryType: {
                    id: InventoryTypeId.CucumberSeed,
                    asTool: false,
                    deliverable: false,
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
                products: [
                    {
                        id: ProductId.Pineapple,
                        isQuality: false,
                        goldAmount: 8,
                        tokenAmount: 0.04,
                        type: ProductType.Crop,
                        cropId: CropId.Pineapple,
                        inventoryType: {
                            id: InventoryTypeId.Pineapple,
                            asTool: false,
                            deliverable: true,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    },
                    {
                        id: ProductId.PineappleQuality,
                        isQuality: true,
                        goldAmount: 8,
                        tokenAmount: 0.04,
                        type: ProductType.Crop,
                        cropId: CropId.Pineapple,
                        inventoryType: {
                            id: InventoryTypeId.PineappleQuality,
                            asTool: false,
                            deliverable: false,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    }
                ],
                inventoryType: {
                    id: InventoryTypeId.PineappleSeed,
                    asTool: false,
                    deliverable: false,
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
                products: [
                    {
                        id: ProductId.Watermelon,
                        isQuality: false,
                        goldAmount: 8,
                        tokenAmount: 0.04,
                        type: ProductType.Crop,
                        cropId: CropId.Watermelon,
                        inventoryType: {
                            id: InventoryTypeId.Watermelon,
                            asTool: false,
                            deliverable: true,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    },
                    {
                        id: ProductId.WatermelonQuality,
                        isQuality: true,
                        goldAmount: 8,
                        tokenAmount: 0.04,
                        type: ProductType.Crop,
                        cropId: CropId.Watermelon,
                        inventoryType: {
                            id: InventoryTypeId.WatermelonQuality,
                            asTool: false,
                            deliverable: false,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    }
                ],
                inventoryType: {
                    id: InventoryTypeId.WatermelonSeed,
                    asTool: false,
                    deliverable: false,
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
                products: [
                    {
                        id: ProductId.BellPepper,
                        isQuality: false,
                        goldAmount: 8,
                        tokenAmount: 0.04,
                        type: ProductType.Crop,
                        cropId: CropId.BellPepper,
                        inventoryType: {
                            id: InventoryTypeId.BellPepper,
                            asTool: false,
                            deliverable: true,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    },
                    {
                        id: ProductId.BellPepperQuality,
                        isQuality: true,
                        goldAmount: 8,
                        tokenAmount: 0.04,
                        type: ProductType.Crop,
                        cropId: CropId.BellPepper,
                        inventoryType: {
                            id: InventoryTypeId.BellPepperQuality,
                            asTool: false,
                            deliverable: false,
                            placeable: false,
                            type: InventoryType.Product
                        }
                    }
                ],
                inventoryType: {
                    id: InventoryTypeId.BellPepperSeed,
                    asTool: false,
                    deliverable: false,
                    placeable: false,
                    type: InventoryType.Seed
                }
            }
        ])

        this.logger.verbose("Crops seeded successfully.")
    }
}
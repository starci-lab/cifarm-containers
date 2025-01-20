import { Logger } from "@nestjs/common"
import { CropEntity, CropId, InventoryType, InventoryTypeId, ProductId, ProductType } from "@src/databases"
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
                product: {
                    id: ProductId.Carrot,
                    isPremium: false,
                    goldAmount: 4,
                    tokenAmount: 0.02,
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
                product: {
                    id: ProductId.Potato,
                    isPremium: false,
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
                product: {
                    id: ProductId.Cucumber,
                    isPremium: false,
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
                product: {
                    id: ProductId.Pineapple,
                    isPremium: false,
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
                product: {
                    id: ProductId.Watermelon,
                    isPremium: false,
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
                product: {
                    id: ProductId.BellPepper,
                    isPremium: false,
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

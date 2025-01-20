import {
    AnimalEntity,
    AnimalId,
    AnimalType,
    InventoryType,
    PlacedItemType,
    PlacedItemTypeId,
    ProductId,
    ProductType
} from "@src/databases"
import { Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { Seeder } from "typeorm-extension"

export class AnimalSeeder implements Seeder {
    private readonly logger = new Logger(AnimalSeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
        this.logger.debug("Seeding animals...")
        await dataSource.manager.save(AnimalEntity, [
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
        ])
        this.logger.verbose("Animals seeded successfully.")
    }
}

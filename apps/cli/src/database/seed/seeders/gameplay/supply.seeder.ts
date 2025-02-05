import { Logger } from "@nestjs/common"
import { AvailableInType, InventoryType, InventoryTypeId, SupplyEntity, SupplyId, SupplyType } from "@src/databases"
import { DataSource } from "typeorm"
import { Seeder } from "typeorm-extension"

export class SupplySeeder implements Seeder {
    private readonly logger = new Logger(SupplySeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
        this.logger.debug("Seeding supplies...")
        await dataSource.manager.save(SupplyEntity, [
            {
                id: SupplyId.BasicFertilizer,
                type: SupplyType.Fertilizer,
                price: 50,
                availableInShop: true,
                fertilizerEffectTimeReduce: 60 * 30,
                inventoryType: {
                    id: InventoryTypeId.BasicFertilizer,
                    asTool: true,
                    availableIn: AvailableInType.Home,
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
                inventoryType: {
                    id: InventoryTypeId.AnimalFeed,
                    asTool: true,
                    availableIn: AvailableInType.Home,
                    deliverable: false,
                    maxStack: 16,
                    placeable: false,
                    type: InventoryType.Supply
                }
            }
        ]) 
        this.logger.verbose("Supplies seeded successfully.")
    }
}

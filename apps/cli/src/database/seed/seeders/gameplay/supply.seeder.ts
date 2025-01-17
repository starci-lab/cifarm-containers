import { Logger } from "@nestjs/common"
import { InventoryType, SupplyEntity, SupplyId, SupplyType } from "@src/databases"
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
                type: SupplyType.AnimalFeed,
                price: 50,
                availableInShop: true,
                fertilizerEffectTimeReduce: 60 * 30,
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
                inventoryType: {
                    id: SupplyId.AnimalFeed,
                    asTool: true,
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

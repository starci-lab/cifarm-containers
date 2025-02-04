import {
    AnimalType,
    BuildingEntity,
    BuildingId,
    PlacedItemType,
    PlacedItemTypeId,
    UpgradeId
} from "@src/databases"
import { Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { Seeder } from "typeorm-extension"

export class BuildingSeeder implements Seeder {
    private readonly logger = new Logger(BuildingSeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
        this.logger.debug("Seeding buildings...")
        await dataSource.manager.save(BuildingEntity, [
            {
                id: BuildingId.Coop,
                availableInShop: true,
                type: AnimalType.Poultry,
                maxUpgrade: 2,
                price: 2000,
                upgrades: [
                    {
                        id: UpgradeId.CoopUpgrade1,
                        capacity: 3,
                        upgradeLevel: 0
                    },
                    {
                        id: UpgradeId.CoopUpgrade2,
                        upgradePrice: 1000,
                        capacity: 5,
                        upgradeLevel: 1
                    },
                    {
                        id: UpgradeId.CoopUpgrade3,
                        upgradePrice: 2000,
                        capacity: 10,
                        upgradeLevel: 2
                    }
                ],
                placedItemType: {
                    id: PlacedItemTypeId.Coop,
                    type: PlacedItemType.Building
                }
            },
            {
                id: BuildingId.Barn,
                availableInShop: true,
                type: AnimalType.Livestock,
                maxUpgrade: 2,
                price: 3000,
                upgrades: [
                    {
                        id: UpgradeId.BarnUpgrade1,
                        capacity: 3,
                        upgradeLevel: 0
                    },
                    {
                        id: UpgradeId.BarnUpgrade2,
                        upgradePrice: 1000,
                        capacity: 5,
                        upgradeLevel: 1
                    },
                    {
                        id: UpgradeId.BarnUpgrade3,
                        upgradePrice: 2000,
                        capacity: 10,
                        upgradeLevel: 2
                    }
                ],
                placedItemType: {
                    id: PlacedItemTypeId.Barn,
                    type: PlacedItemType.Building
                }
            },
            {
                id: BuildingId.Home,
                availableInShop: false,
                maxUpgrade: 0,
                price: 0,
                placedItemType: {
                    id: PlacedItemTypeId.Home,
                    type: PlacedItemType.Building
                }
            }
        ]
        )
        this.logger.verbose("Buildings seeded successfully.")
    }
}
import { Logger } from "@nestjs/common"
import { InventoryType, PlacedItemType, PlacedItemTypeId, TileEntity, TileId } from "@src/databases"
import { DataSource } from "typeorm"
import { Seeder } from "typeorm-extension"

export class TileSeeder implements Seeder {
    private readonly logger = new Logger(TileSeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
        this.logger.debug("Seeding tiles...")
        await dataSource.manager.save(TileEntity, [
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
        ])
        this.logger.verbose("Tiles seeded successfully.")
    }
}

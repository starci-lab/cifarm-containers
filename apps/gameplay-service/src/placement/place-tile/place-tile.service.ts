import { Injectable, Logger } from "@nestjs/common"
import {
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
} from "@src/database"
import {
    InventoryNotFoundException,
    InventoryNotTypePlacedException,
    InventoryTypeNotTileException,
    PlaceTileTransactionFailedException
} from "@src/exceptions"
import { DataSource } from "typeorm"
import { PlaceTileRequest, PlaceTileResponse } from "./place-tile.dto"
@Injectable()
export class PlaceTileService {
    private readonly logger = new Logger(PlaceTileService.name)

    constructor(private readonly dataSource: DataSource) {}

    async placeTile(request: PlaceTileRequest): Promise<PlaceTileResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: {
                    id: request.inventoryTileId,
                    userId: request.userId
                },
                relations: {
                    inventoryType: true
                }
            })

            if (!inventory) throw new InventoryNotFoundException(request.inventoryTileId)

            if (inventory.inventoryType.type !== InventoryType.Tile)
                throw new InventoryTypeNotTileException(request.inventoryTileId)

            if (!inventory.isPlaced) throw new InventoryNotTypePlacedException(request.inventoryTileId)

            await queryRunner.startTransaction()
            try {
                // Mark inventory as placed
                if(inventory.quantity == 1) {
                    await queryRunner.manager.delete(InventoryEntity, inventory.id)
                } else{
                    await queryRunner.manager.update(InventoryEntity, inventory.id, {
                        quantity: inventory.quantity - 1,
                    })
                }

                // Create placed tile
                const placedTile = await queryRunner.manager.save(PlacedItemEntity, {
                    userId: request.userId,
                    inventoryId: inventory.id,
                    placedItemTypeId: inventory.inventoryType.id,
                    x: request.position.x,
                    y: request.position.y
                })

                await queryRunner.commitTransaction()

                this.logger.log(`Successfully placed tile with ID: ${placedTile.id}`)
                return { placedItemTileId: placedTile.id }
            } catch (error) {
                this.logger.error("Place Tile transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new PlaceTileTransactionFailedException(error)
            }
        } finally {
            await queryRunner.release()
        }
    }
}

import { Injectable, Logger } from "@nestjs/common"
import {
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    PlacedItemSchema
} from "@src/databases"
import { DataSource } from "typeorm"
import { PlaceTileRequest, PlaceTileResponse } from "./place-tile.dto"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"
@Injectable()
export class PlaceTileService {
    private readonly logger = new Logger(PlaceTileService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
    ) {
    }

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

            if (!inventory) throw new GrpcNotFoundException("Tile not found in inventory")

            if (inventory.inventoryType.type !== InventoryType.Tile)
                throw new GrpcFailedPreconditionException("Inventory item is not a tile")

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
                const placedTile = await queryRunner.manager.save(PlacedItemSchema, {
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
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcNotFoundException(errorMessage)
            }
        } catch (error) {
            this.logger.error("Place Tile failed", error)
            throw error
        }
        finally {
            await queryRunner.release()
        }
    }
}

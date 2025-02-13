import { Injectable, Logger } from "@nestjs/common"
import {
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemSchema,
    PlacedItemType
} from "@src/databases"
import { InventoryService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { RecoverTileRequest, RecoverTileResponse } from "./recover-tile.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class RecoverTileService {
    private readonly logger = new Logger(RecoverTileService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService
    ) {}

    async recoverTile(request: RecoverTileRequest): Promise<RecoverTileResponse> {
        this.logger.debug(`Received request to recover tile: ${JSON.stringify(request)}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placedItem = await queryRunner.manager.findOne(PlacedItemSchema, {
                where: { id: request.placedItemTileId },
                relations: {
                    placedItemType: true
                }
            })

            if (!placedItem) throw new GrpcNotFoundException("Placed item not found")
            if (placedItem.placedItemType.type != PlacedItemType.Tile)
                throw new GrpcFailedPreconditionException("Placed item is not a tile")

            //Get inventory type
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: { tileId: placedItem.placedItemType.tileId, type: InventoryType.Tile }
            })

            // Get inventory same type
            const existingInventories = await queryRunner.manager.find(InventoryEntity, {
                where: {
                    userId: request.userId,
                    inventoryTypeId: inventoryType.id
                },
                relations: {
                    inventoryType: true
                }
            })

            await queryRunner.startTransaction()

            try {
                // Delete the placed item
                await queryRunner.manager.delete(PlacedItemSchema, {
                    id: request.placedItemTileId,
                    userId: request.userId
                })

                const updatedInventories = this.inventoryService.add({
                    entities: existingInventories,
                    userId: request.userId,
                    data: {
                        inventoryType: inventoryType,
                        quantity: 1
                    }
                })

                await queryRunner.manager.save(InventoryEntity, updatedInventories)

                await queryRunner.commitTransaction()

                return {
                    inventoryTileId: updatedInventories[updatedInventories.length - 1].id
                }
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }
        } catch (err) {
            this.logger.error(err)
            throw err
        } finally {
            await queryRunner.release()
        }
    }
}

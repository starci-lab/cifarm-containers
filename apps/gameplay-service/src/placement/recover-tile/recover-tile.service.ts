import { Injectable, Logger } from "@nestjs/common"
import { GameplayPostgreSQLService, InventoryEntity, InventoryType, InventoryTypeEntity, PlacedItemEntity, PlacedItemType } from "@src/databases"
import { PlacedItemNotFoundException, PlacedItemTypeNotTileException } from "@src/exceptions"
import { InventoryService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { RecoverTileRequest, RecoverTileResponse } from "./recover-tile.dto"

@Injectable()
export class RecoverTileService {
    private readonly logger = new Logger(RecoverTileService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
        private readonly inventoryService: InventoryService
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async recoverTile(request: RecoverTileRequest): Promise<RecoverTileResponse> {
        this.logger.debug(`Received request to recover tile: ${JSON.stringify(request)}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: request.placedItemTileId },
                relations: {
                    placedItemType: true
                }
            })

            if (!placedItem) throw new PlacedItemNotFoundException(request.placedItemTileId)
            if(placedItem.placedItemType.type != PlacedItemType.Tile) throw new PlacedItemTypeNotTileException()

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
                await queryRunner.manager.delete(PlacedItemEntity, {
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
            } catch (err) {
                // Rollback transaction in case of error
                this.logger.error("Recover Tile transaction failed, rolling back...", err)
                await queryRunner.rollbackTransaction()
                throw err
            }
        }catch(err){
            this.logger.error(err)
            throw err
        }
        finally {
            await queryRunner.release()
        }
    }
}

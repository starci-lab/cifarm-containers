import { Injectable, Logger } from "@nestjs/common"
import { InventoryEntity, PlacedItemEntity, PlacedItemType, UserEntity } from "@src/database"
import { InventoryNotFoundException, PlacedItemInventoryNotFoundException, PlacedItemNotFoundException, PlacedItemTypeNotTileException, UserNotFoundException } from "@src/exceptions"
import { DataSource } from "typeorm"
import RecoverTileRequest from "./recover-tile.dto"

@Injectable()
export class RecoverTileService {
    private readonly logger = new Logger(RecoverTileService.name)

    constructor(private readonly dataSource: DataSource) {}

    async recoverTile(request: RecoverTileRequest) {
        this.logger.debug(`Received request to move placement: ${JSON.stringify(request)}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })
            if (!user) throw new UserNotFoundException(request.userId)

            const placedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: request.placedItemKey }
            })

            if (!placedItem) throw new PlacedItemNotFoundException(request.placedItemKey)
            if(!placedItem.inventoryId) throw new PlacedItemInventoryNotFoundException()
            if(placedItem.placedItemType.type != PlacedItemType.Tile) throw new PlacedItemTypeNotTileException()
                            
            await queryRunner.startTransaction()

            try {
                // Delete the placed item
                await queryRunner.manager.delete(PlacedItemEntity, {
                    id:request.placedItemKey
                    ,userId:request.userId
                })

                // Update inventory
                const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                    where: { 
                        id: placedItem.inventoryId ,
                        userId: request.userId,
                    }
                })
                if (!inventory) throw new InventoryNotFoundException(placedItem.inventoryId)
                // update the tile
                await queryRunner.manager.update(InventoryEntity, placedItem.inventoryId, {
                    isPlaced: false,
                    userId: request.userId
                })   
                await queryRunner.commitTransaction()
            } catch (err) {
                // Rollback transaction in case of error
                this.logger.error("Recover Tile transaction failed, rolling back...", err)
                await queryRunner.rollbackTransaction()
                throw err
            }
        }
        finally {
            await queryRunner.release()
        }
    }
}

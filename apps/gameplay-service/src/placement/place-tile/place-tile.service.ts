import { Injectable, Logger } from "@nestjs/common"
import { InventoryEntity, InventoryType, PlacedItemEntity, UserEntity } from "@src/database"
import { InventoryAlreadyPlacedException, InventoryNotFoundException, InventoryTypeNotTileException, UserNotFoundException } from "@src/exceptions"
import { DataSource } from "typeorm"
import { PlaceTileRequest, PlaceTileResponse } from "../../farming/place-tile"

@Injectable()
export class PlaceTitleService {
    private readonly logger = new Logger(PlaceTitleService.name)

    constructor(private readonly dataSource: DataSource) {}

    async move(request: PlaceTileRequest):Promise<PlaceTileResponse> {
        this.logger.debug(`Received request to move placement: ${JSON.stringify(request)}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            await queryRunner.startTransaction()
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })
            if (!user) throw new UserNotFoundException(request.userId)
            const inventory =  await queryRunner.manager.findOne(InventoryEntity, {
                where: { id: request.inventoryTileId },
                relations: {
                    inventoryType: true
                }
            })
            
            if (!inventory) throw new InventoryNotFoundException(request.inventoryTileId)
            if(inventory.inventoryType.type != InventoryType.Tile) throw new InventoryTypeNotTileException(request.inventoryTileId)
            if(inventory.isPlaced) throw new InventoryAlreadyPlacedException(request.inventoryTileId)

            const result = queryRunner.manager.create(PlacedItemEntity, {
                inventoryId: request.inventoryTileId,
                x: request.position.x,
                y: request.position.y,
                userId: request.userId
            })
            
            await queryRunner.manager.update(InventoryEntity, request.inventoryTileId, {
                isPlaced: true,
                userId: request.userId
            })
            await queryRunner.commitTransaction()
            return {
                placedItemTileKey: result.id
            }
        } finally {
            await queryRunner.release()
        }
    }
}

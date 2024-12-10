import { Injectable, Logger } from "@nestjs/common"
import { PlacedItemEntity, UserEntity } from "@src/database"
import { PlacedItemNotFoundException, UserNotFoundException } from "@src/exceptions"
import { DataSource } from "typeorm"
import PlacementMoveRequest from "./placement-move.dto"

@Injectable()
export class PlacementMoveService {
    private readonly logger = new Logger(PlacementMoveService.name)

    constructor(private readonly dataSource: DataSource) {}

    async move(request: PlacementMoveRequest) {
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
            if(inventory.inventoryType.type != InventoryType.Tile) throw new InventoryTypeNotTileException(request.inventoryTileId)
            if(inventory.isPlaced) throw new InventoryAlreadyPlacedException(request.inventoryTileId)
            
            
            await queryRunner.manager.update(PlacedItemEntity, request.placedItemKey, {
                x: request.position.x,
                y: request.position.y
            })
        }
        finally {
            await queryRunner.release()
        }
    }
}

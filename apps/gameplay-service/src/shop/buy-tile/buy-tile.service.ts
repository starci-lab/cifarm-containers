import { Injectable, Logger } from "@nestjs/common"
import {
    PlacedItemEntity,
    PlacedItemType,
    PlacedItemTypeEntity,
    TileEntity,
    UserEntity
} from "@src/database"
import {
    BuyTileTransactionFailedException,
    PlacedItemIsLimitException,
    PlacedItemTypeNotFoundException,
    TileNotAvailableInShopException,
    TileNotFoundException
} from "@src/exceptions"
import { GoldBalanceService } from "@src/services"
import { DataSource, DeepPartial } from "typeorm"
import { BuyTileRequest, BuyTileResponse } from "./buy-tile.dto"

@Injectable()
export class BuyTileService {
    private readonly logger = new Logger(BuyTileService.name)

    constructor(
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async buyTile(request: BuyTileRequest): Promise<BuyTileResponse> {
        this.logger.debug(
            `Starting tile purchase for user ${request.userId}, tile id: ${request.tileId}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Fetch tile information
            const tile = await queryRunner.manager.findOne(TileEntity, {
                where: { id: request.tileId }
            })

            if (!tile) {
                throw new TileNotFoundException(request.tileId)
            }

            if (!tile.availableInShop) {
                throw new TileNotAvailableInShopException(request.tileId)
            }

            // Fetch placed item type
            const placedItemType = await queryRunner.manager.findOne(PlacedItemTypeEntity, {
                where: { type: PlacedItemType.Tile, tileId: request.tileId },
                relations: {
                    tile: true
                }
            })

            if (!placedItemType) {
                throw new PlacedItemTypeNotFoundException(request.tileId)
            }

            // Calculate total cost
            const totalCost = tile.price

            const user: UserEntity = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            // Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            //Check max tile limit
            const placedItems = await queryRunner.manager.find(PlacedItemEntity, {
                where: { userId: request.userId, placedItemTypeId: placedItemType.id }
            })

            if (placedItems.length >= placedItemType.tile.maxOwnership)
                throw new PlacedItemIsLimitException(
                    request.tileId,
                    placedItemType.tile.maxOwnership
                )

            // Start transaction
            await queryRunner.startTransaction()
            try {
                // Subtract gold
                const goldsChanged = this.goldBalanceService.subtract({
                    entity: user,
                    golds: totalCost
                })

                await queryRunner.manager.update(UserEntity, user.id, {
                    ...goldsChanged
                })

                // Prepare placed item entity
                const placedItem: DeepPartial<PlacedItemEntity> = {
                    userId: request.userId,
                    x: request.position.x,
                    y: request.position.y,
                    placedItemTypeId: placedItemType.id
                }

                // Save the placed item in the database
                const savedTile = await queryRunner.manager.save(PlacedItemEntity, placedItem)

                await queryRunner.commitTransaction()

                this.logger.log(`Successfully purchased tile with id: ${savedTile.id}`)

                return { placedItemId: savedTile.id }
            } catch (error) {
                this.logger.error("Purchase transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new BuyTileTransactionFailedException(error)
            }
        } finally {
            await queryRunner.release()
        }
    }
}

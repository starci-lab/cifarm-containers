import { Injectable, Logger } from "@nestjs/common"
import {
    PlacedItemEntity,
    PlacedItemType,
    PlacedItemTypeEntity,
    TileEntity,
    TileId,
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
import { DataSource, DeepPartial, QueryRunner } from "typeorm"
import { BuyTileRequest, BuyTileResponse } from "./buy-tile.dto"

@Injectable()
export class BuyTileService {
    private readonly logger = new Logger(BuyTileService.name)

    private tileOrder = [TileId.BasicTile1, TileId.BasicTile2, TileId.BasicTile3]

    constructor(
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async buyTile(request: BuyTileRequest): Promise<BuyTileResponse> {
        this.logger.debug(`Starting tile purchase for user ${request.userId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const currentTileId = await this.determineCurrentTileId(request.userId, queryRunner)

            const tile = await queryRunner.manager.findOne(TileEntity, {
                where: { id: currentTileId }
            })

            if (!tile) {
                throw new TileNotFoundException(currentTileId)
            }

            if (!tile.availableInShop) {
                throw new TileNotAvailableInShopException(currentTileId)
            }

            const placedItemType = await queryRunner.manager.findOne(PlacedItemTypeEntity, {
                where: { type: PlacedItemType.Tile, tileId: currentTileId }
            })

            if (!placedItemType) {
                throw new PlacedItemTypeNotFoundException(currentTileId)
            }

            // Calculate total cost
            const totalCost = tile.price

            const user: UserEntity = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            // Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            // Start transaction
            await queryRunner.startTransaction()
            try {
                // Subtract gold
                const goldsChanged = this.goldBalanceService.subtract({
                    entity: user,
                    amount: totalCost
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

    private async determineCurrentTileId(
        userId: string,
        queryRunner: QueryRunner
    ): Promise<string> {
        for (const tileId of this.tileOrder) {
            const tile = await queryRunner.manager.findOne(TileEntity, { where: { id: tileId } })

            const placedItemsCount = await queryRunner.manager.count(PlacedItemEntity, {
                where: {
                    userId,
                    placedItemType: {
                        tileId: tileId,
                        type: PlacedItemType.Tile
                    }
                },
                relations: {
                    placedItemType: true
                }
            })

            if (placedItemsCount < tile.maxOwnership) {
                return tileId
            }
        }

        throw new PlacedItemIsLimitException(this.tileOrder[this.tileOrder.length - 1])
    }
}

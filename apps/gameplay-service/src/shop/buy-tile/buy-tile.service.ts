import { Injectable, Logger } from "@nestjs/common"
import {
    GameplayPostgreSQLService,
    PlacedItemEntity,
    PlacedItemType,
    PlacedItemTypeEntity,
    TileEntity,
    TileId,
    UserEntity
} from "@src/databases"
import {
    BuyTileTransactionFailedException,
    PlacedItemIsLimitException,
    PlacedItemTypeNotFoundException,
    TileNotAvailableInShopException,
    TileNotFoundException
} from "@src/exceptions"
import { GoldBalanceService } from "@src/gameplay"
import { DataSource, DeepPartial, QueryRunner } from "typeorm"
import { BuyTileRequest, BuyTileResponse } from "./buy-tile.dto"

@Injectable()
export class BuyTileService {
    private readonly logger = new Logger(BuyTileService.name)

    private tileOrder = [TileId.BasicTile1, TileId.BasicTile2, TileId.BasicTile3]

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
        private readonly goldBalanceService: GoldBalanceService
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

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

            // Prepare placed item entity
            const placedItem: DeepPartial<PlacedItemEntity> = {
                userId: request.userId,
                x: request.position.x,
                y: request.position.y,
                placedItemTypeId: placedItemType.id
            }

            // Subtract gold
            const goldsChanged = this.goldBalanceService.subtract({
                entity: user,
                amount: totalCost
            })
            // Start transaction
            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.update(UserEntity, user.id, {
                    ...goldsChanged
                })

                // Save the placed item in the database
                await queryRunner.manager.save(PlacedItemEntity, placedItem)

                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error("Purchase transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new BuyTileTransactionFailedException(error)
            }

            return {}
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

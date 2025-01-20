import { Injectable, Logger } from "@nestjs/common"
import {
    InjectPostgreSQL,
    PlacedItemEntity,
    PlacedItemType,
    PlacedItemTypeEntity,
    TileEntity,
    UserEntity
} from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { DataSource, DeepPartial } from "typeorm"
import { BuyTileRequest, BuyTileResponse } from "./buy-tile.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class BuyTileService {
    private readonly logger = new Logger(BuyTileService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async buyTile(request: BuyTileRequest): Promise<BuyTileResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const tile = await queryRunner.manager.findOne(TileEntity, {
                where: { id: request.tileId }
            })

            if (!tile) {
                throw new GrpcNotFoundException("Tile not found")
            }

            if (!tile.availableInShop) {
                throw new GrpcFailedPreconditionException("Tile not available in shop")
            }

            const placedItemType = await queryRunner.manager.findOne(PlacedItemTypeEntity, {
                where: { type: PlacedItemType.Tile, tileId: request.tileId }
            })

            // get users
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            // Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: tile.price })

            // get tiles count
            const count = await queryRunner.manager.count(PlacedItemEntity, {
                where: {
                    placedItemType: {
                        tile: {
                            id: request.tileId
                        }
                    }
                }
            })

            // check tile count
            if (count >= tile.maxOwnership) {
                throw new GrpcFailedPreconditionException("Tile max ownership reached")
            }

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
                amount: tile.price
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
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}

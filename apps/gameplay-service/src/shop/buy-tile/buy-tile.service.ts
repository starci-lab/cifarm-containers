import { Injectable, Logger } from "@nestjs/common"
import {
    InjectPostgreSQL,
    PlacedItemSchema,
    PlacedItemType,
    PlacedItemTypeEntity,
    TileEntity,
    UserSchema
} from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { BuyTileRequest, BuyTileResponse } from "./buy-tile.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"
import { InjectKafka } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"
import { KafkaPattern } from "@src/brokers"

@Injectable()
export class BuyTileService {
    private readonly logger = new Logger(BuyTileService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
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
            const user = await queryRunner.manager.findOne(UserSchema, {
                where: { id: request.userId }
            })

            // Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: tile.price })

            // get tiles count
            const count = await queryRunner.manager.count(PlacedItemSchema, {
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

            // Subtract gold
            const goldsChanged = this.goldBalanceService.subtract({
                entity: user,
                amount: tile.price
            })
            // Start transaction
            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.update(UserSchema, user.id, {
                    ...goldsChanged
                })

                // Save the placed item in the database
                await queryRunner.manager.save(PlacedItemSchema, {
                    userId: request.userId,
                    x: request.position.x,
                    y: request.position.y,
                    placedItemTypeId: placedItemType.id,
                    tileInfo: {}
                })

                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }

            // Publish event
            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: user.id
            })
            
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}

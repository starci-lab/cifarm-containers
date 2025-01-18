import { Injectable, Logger } from "@nestjs/common"
import {
    CropEntity,
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    UserEntity
} from "@src/databases"
import { GoldBalanceService, InventoryService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { BuySeedsRequest, BuySeedsResponse } from "./buy-seeds.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class BuySeedsService {
    private readonly logger = new Logger(BuySeedsService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService
    ) {
    }

    async buySeeds(request: BuySeedsRequest): Promise<BuySeedsResponse> {
        this.logger.debug(
            `Calling buying seed for user ${request.userId}, id: ${request.cropId}, quantity: ${request.quantity}`
        )
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const crop = await queryRunner.manager.findOne(CropEntity, {
                where: { id: request.cropId }
            })

            if (!crop) throw new GrpcNotFoundException("Crop not found")
            if (!crop.availableInShop) throw new GrpcFailedPreconditionException("Crop not available in shop")

            const totalCost = crop.price * request.quantity

            const user: UserEntity = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            //Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            //Get inventory type
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: { cropId: request.cropId, type: InventoryType.Seed }
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

            const updatedInventories = this.inventoryService.add({
                entities: existingInventories,
                userId: request.userId,
                data: {
                    inventoryType: inventoryType,
                    quantity: request.quantity
                }
            })

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

                //Save inventory
                await queryRunner.manager.save(InventoryEntity, updatedInventories)
                await queryRunner.commitTransaction()

                return {}
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }
        } finally {
            await queryRunner.release()
        }
    }
}

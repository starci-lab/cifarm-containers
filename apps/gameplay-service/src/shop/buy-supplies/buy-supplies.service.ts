import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, InventoryEntity, InventoryTypeEntity, SupplyEntity, UserSchema } from "@src/databases"
import { GoldBalanceService, InventoryService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { BuySuppliesRequest, BuySuppliesResponse } from "./buy-supplies.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class BuySuppliesService {
    private readonly logger = new Logger(BuySuppliesService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService
    ) {
    }

    async buySupplies(request: BuySuppliesRequest): Promise<BuySuppliesResponse> {
        this.logger.debug(
            `Buying supply for user ${request.userId}, id: ${request.supplyId}, quantity: ${request.quantity}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const supply = await queryRunner.manager.findOne(SupplyEntity, {
                where: { id: request.supplyId }
            })
            if (!supply) throw new GrpcNotFoundException("Supply not found")
            if (!supply.availableInShop)
                throw new GrpcFailedPreconditionException("Supply not available in shop")

            const totalCost = supply.price * request.quantity

            const user: UserSchema = await queryRunner.manager.findOne(UserSchema, {
                where: { id: request.userId }
            })

            if (!user) throw new GrpcNotFoundException("User not found")

            //Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            // Get inventory type
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: { supplyId: request.supplyId }
            })

            // Get inventory same type
            const existingInventories = await queryRunner.manager.find(InventoryEntity, {
                where: {
                    userId: request.userId,
                    inventoryType: {
                        supplyId: request.supplyId
                    }
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

                await queryRunner.manager.update(UserSchema, user.id, {
                    ...goldsChanged
                })

                // Save inventory
                await queryRunner.manager.save(InventoryEntity, updatedInventories)
                await queryRunner.commitTransaction()
                return
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

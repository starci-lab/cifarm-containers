import { Injectable, Logger } from "@nestjs/common"
import { InventoryEntity, InventoryTypeEntity, SupplyEntity, UserEntity } from "@src/database"
import {
    BuySuppliesTransactionFailedException,
    SupplyNotAvailableInShopException,
    SupplyNotFoundException,
    UserNotFoundException
} from "@src/exceptions"
import { GoldBalanceService, InventoryService } from "@src/services"
import { DataSource } from "typeorm"
import { BuySuppliesRequest, BuySuppliesResponse } from "./buy-supplies.dto"

@Injectable()
export class BuySuppliesService {
    private readonly logger = new Logger(BuySuppliesService.name)

    constructor(
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async buySupplies(request: BuySuppliesRequest): Promise<BuySuppliesResponse> {
        this.logger.debug(
            `Buying supply for user ${request.userId}, id: ${request.id}, quantity: ${request.quantity}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const supply = await queryRunner.manager.findOne(SupplyEntity, {
                where: { id: request.id }
            })
            if (!supply) throw new SupplyNotFoundException(request.id)
            if (!supply.availableInShop) throw new SupplyNotAvailableInShopException(request.id)

            const totalCost = supply.price * request.quantity

            const user: UserEntity = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            if (!user) throw new UserNotFoundException(request.userId)

            //Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

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

                // Get inventory type
                const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                    where: { supplyId: request.id }
                })

                // Get inventory same type
                const existingInventories = await queryRunner.manager.find(InventoryEntity, {
                    where: {
                        userId: request.userId,
                        inventoryType: {
                            supplyId: request.id
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

                // Save inventory
                await queryRunner.manager.save(InventoryEntity, updatedInventories)
                await queryRunner.commitTransaction()
                return
            } catch (error) {
                this.logger.debug("rollback")
                await queryRunner.rollbackTransaction()
                throw new BuySuppliesTransactionFailedException(error)
            }
        } finally {
            await queryRunner.release()
        }
    }
}

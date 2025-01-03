import { Injectable, Logger } from "@nestjs/common"
import {
    DeliverProductTransactionFailedException,
    InsufficientInventoryException,
    InventoryNotFoundException,
    InventoryTypeNotDeliverableException
} from "@src/exceptions"
import { DataSource, DeepPartial } from "typeorm"
import { DeliverProductRequest, DeliverProductResponse } from "./deliver-product.dto"
import { DeliveringProductEntity, GameplayPostgreSQLService, InventoryEntity } from "@src/databases"

@Injectable()
export class DeliverProductService {
    private readonly logger = new Logger(DeliverProductService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async deliverProduct(request: DeliverProductRequest): Promise<DeliverProductResponse> {
        this.logger.debug(
            `Starting product delivery for user ${request.userId}, inventory id: ${request.inventoryId}, quantity: ${request.quantity}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Fetch inventory
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: { id: request.inventoryId, userId: request.userId },
                relations: {
                    inventoryType: true
                }
            })

            if (!inventory) {
                throw new InventoryNotFoundException(request.inventoryId)
            }

            if (inventory.quantity < request.quantity) {
                throw new InsufficientInventoryException(request.inventoryId, request.quantity)
            }

            // Check if inventory type is deliverable
            const inventoryType = inventory.inventoryType
            if (!inventoryType.deliverable) {
                throw new InventoryTypeNotDeliverableException(request.inventoryId)
            }

            // Start transaction
            await queryRunner.startTransaction()

            try {
                // Update inventory (subtract delivered quantity)
                inventory.quantity -= request.quantity
                if (inventory.quantity === 0) {
                    await queryRunner.manager.remove(InventoryEntity, inventory)
                } else {
                    await queryRunner.manager.save(InventoryEntity, inventory)
                }

                // Prepare delivering product entity
                const deliveringProduct: DeepPartial<DeliveringProductEntity> = {
                    userId: request.userId,
                    quantity: request.quantity,
                    premium: inventory.premium,
                    index: request.index,
                    productId: inventory.inventoryType.productId
                }

                // Save delivering product in database
                await queryRunner.manager.save(
                    DeliveringProductEntity,
                    deliveringProduct
                )

                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error("Delivery transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new DeliverProductTransactionFailedException(error)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}

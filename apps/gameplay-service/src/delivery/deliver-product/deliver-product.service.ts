import { Injectable, Logger } from "@nestjs/common"
import { DeliveringProductEntity, InjectPostgreSQL, InventoryEntity } from "@src/databases"
import { DataSource, DeepPartial } from "typeorm"
import { DeliverProductRequest, DeliverProductResponse } from "./deliver-product.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class DeliverProductService {
    private readonly logger = new Logger(DeliverProductService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

    async deliverProduct(request: DeliverProductRequest): Promise<DeliverProductResponse> {
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
                throw new GrpcNotFoundException("Inventory not found")
            }

            if (inventory.quantity < request.quantity) {
                throw new GrpcFailedPreconditionException("Not enough quantity to deliver")
            }

            // Check if inventory type is deliverable
            const inventoryType = inventory.inventoryType
            if (!inventoryType.deliverable) {
                throw new GrpcFailedPreconditionException("Inventory type is not deliverable")
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
                await queryRunner.manager.save(DeliveringProductEntity, deliveringProduct)

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

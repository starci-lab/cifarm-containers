import { Injectable, Logger } from "@nestjs/common"
import { DeliveringProductEntity, InjectPostgreSQL, InventoryEntity, InventoryType, InventoryTypeEntity } from "@src/databases"
import {
    DeliveringProductNotFoundException,
    RetainProductTransactionFailedException
} from "@src/exceptions"
import { InventoryService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { RetainProductRequest, RetainProductResponse } from "./retain-product.dto"

@Injectable()
export class RetainProductService {
    private readonly logger = new Logger(RetainProductService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService
    ) {
    }

    async retainProduct(request: RetainProductRequest): Promise<RetainProductResponse> {
        this.logger.debug(
            `Starting retain product for user ${request.userId}, delivering product id: ${request.deliveringProductId}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Fetch delivering product
            const deliveringProduct = await queryRunner.manager.findOne(DeliveringProductEntity, {
                where: { id: request.deliveringProductId, userId: request.userId }
            })

            if (!deliveringProduct) {
                throw new DeliveringProductNotFoundException(request.deliveringProductId)
            }

            //Get inventory type
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: { type: InventoryType.Product, productId: deliveringProduct.productId }
            })

            // Get inventory same type
            const existingInventories = await queryRunner.manager.find(InventoryEntity, {
                where: {
                    userId: request.userId,
                    inventoryType: inventoryType
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
                    quantity: deliveringProduct.quantity
                }
            })

            // Start transaction
            await queryRunner.startTransaction()

            try {
                // Save Retaining product in database
                await queryRunner.manager.remove(
                    DeliveringProductEntity,
                    deliveringProduct
                )

                //Save inventory
                await queryRunner.manager.save(InventoryEntity, updatedInventories)

                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error("Retain transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new RetainProductTransactionFailedException(error)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}

import { Injectable, Logger } from "@nestjs/common"
import { DeliveringProductEntity } from "@src/database"
import {
    DeliveringProductNotFoundException,
    RetainProductTransactionFailedException
} from "@src/exceptions"
import { DataSource } from "typeorm"
import { RetainProductRequest, RetainProductResponse } from "./retain-product.dto"

@Injectable()
export class RetainProductService {
    private readonly logger = new Logger(RetainProductService.name)

    constructor(private readonly dataSource: DataSource) {}

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
            // Start transaction
            await queryRunner.startTransaction()

            try {
                // Save Retaining product in database
                await queryRunner.manager.remove(
                    DeliveringProductEntity,
                    deliveringProduct
                )

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

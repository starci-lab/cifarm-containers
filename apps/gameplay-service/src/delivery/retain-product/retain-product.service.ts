import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, 
    // InventoryType 
} from "@src/databases"
import { InventoryService } from "@src/gameplay"
import { 
    // RetainProductRequest, 
    RetainProductResponse } from "./retain-product.dto"
import { 
// GrpcInternalException, GrpcNotFoundException
} from "nestjs-grpc-exceptions"
import { Connection } from "mongoose"

@Injectable()
export class RetainProductService {
    private readonly logger = new Logger(RetainProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly inventoryService: InventoryService
    ) {
    }

    async retainProduct(
    // request: RetainProductRequest
    ): Promise<RetainProductResponse> {
        // const queryRunner = this.dataSource.createQueryRunner()
        // await queryRunner.connect()

        // try {
        //     // Fetch delivering product
        //     const deliveringProduct = await queryRunner.manager.findOne(DeliveringProductEntity, {
        //         where: { id: request.deliveringProductId, userId: request.userId }
        //     })

        //     if (!deliveringProduct) {
        //         throw new GrpcNotFoundException("Delivering product not found")
        //     }

        //     //Get inventory type
        //     const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
        //         where: { type: InventoryType.Product, productId: deliveringProduct.productId }
        //     })

        //     // Get inventory same type
        //     const existingInventories = await queryRunner.manager.find(InventoryEntity, {
        //         where: {
        //             userId: request.userId,
        //             inventoryTypeId: inventoryType.id
        //         },
        //         relations: {
        //             inventoryType: true
        //         }
        //     })

        //     const updatedInventories = this.inventoryService.add({
        //         entities: existingInventories,
        //         userId: request.userId,
        //         data: {
        //             inventoryType: inventoryType,
        //             quantity: deliveringProduct.quantity
        //         }
        //     })
            
        //     // Start transaction
        //     await queryRunner.startTransaction()

        //     try {
        //         // Save Retaining product in database
        //         await queryRunner.manager.remove(
        //             DeliveringProductEntity,
        //             deliveringProduct
        //         )

        //         //Save inventory
        //         await queryRunner.manager.save(InventoryEntity, updatedInventories)

        //         await queryRunner.commitTransaction()
        //     } catch (error) {
        //         const errorMessage = `Transaction failed, reason: ${error.message}`
        //         this.logger.error(errorMessage)
        //         await queryRunner.rollbackTransaction()
        //         throw new GrpcInternalException(errorMessage)
        //     }
        //     return {}
        // } finally {
        //     await queryRunner.release()
        // }
        return {}
    }
}

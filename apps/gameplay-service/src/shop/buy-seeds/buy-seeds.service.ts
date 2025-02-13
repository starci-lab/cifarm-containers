import { Injectable, Logger } from "@nestjs/common"
import { GrpcFailedPreconditionException } from "@src/common"
import {
    CropSchema,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { BuySeedsRequest, BuySeedsResponse } from "./buy-seeds.dto"

@Injectable()
export class BuySeedsService {
    private readonly logger = new Logger(BuySeedsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService
    ) {
    }

    async buySeeds(request: BuySeedsRequest): Promise<BuySeedsResponse> {
        this.logger.debug(
            `Calling buying seed for user ${request.userId}, id: ${request.cropId}, quantity: ${request.quantity}`
        )

        // Start session
        const mongoSession = await this.connection.startSession()     

        try {
            const crop = await this.connection.model<CropSchema>(CropSchema.name)
                .findOne({
                    id: request.cropId
                })

            if (!crop) throw new GrpcNotFoundException("Crop not found")
            if (!crop.availableInShop) throw new GrpcFailedPreconditionException("Crop not available in shop")

            const totalCost = crop.price * request.quantity

            const user: UserSchema = await this.connection.model<UserSchema>(UserSchema.name)
                .findOne({
                    id: request.userId
                })

            //Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            //Get inventory type
            const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                .findOne({
                    cropId: request.cropId,
                    type: InventoryType.Seed
                })

            // Get inventory same type
            const existingInventories = await this.connection.model<InventorySchema>(InventorySchema.name)
                .find({
                    userId: request.userId,
                    inventoryTypeId: inventoryType.id
                })
                .populate(InventoryTypeSchema.name)


            const updatedInventories = this.inventoryService.add({
                inventories: existingInventories,
                inventoryType: inventoryType,
                quantity: request.quantity
            })

            // Start transaction
            mongoSession.startTransaction()

            try {
                // Subtract gold
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: totalCost
                })

                //update
                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { id: user.id },
                    { ...goldsChanged }
                )

                //Save inventory
                await this.connection.model<InventorySchema>(InventorySchema.name).insertMany(updatedInventories.createdInventories)
                mongoSession.commitTransaction()

                return {}
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                mongoSession.abortTransaction()
                throw new GrpcInternalException(errorMessage)
            }
        } finally {
            mongoSession.endSession()
        }
    }
}

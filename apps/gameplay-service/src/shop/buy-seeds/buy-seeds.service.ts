import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    CropSchema,
    DefaultInfo,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    SystemId,
    SystemRecord,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
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
        mongoSession.startTransaction()
        
        try {
            const crop = await this.connection.model<CropSchema>(CropSchema.name)
                .findById(createObjectId(request.cropId))
                .session(mongoSession)

            if (!crop) throw new GrpcNotFoundException("Crop not found")
            if (!crop.availableInShop) throw new GrpcFailedPreconditionException("Crop not available in shop")

            const totalCost = crop.price * request.quantity

            const user: UserSchema = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(request.userId)
                .session(mongoSession)

            //Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            //Get inventory type
            const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).findOne({
                type: InventoryType.Seed,
                crop: createObjectId(request.cropId)
            }).session(mongoSession)

            if (!inventoryType) {
                throw new GrpcNotFoundException("Inventory seed type not found")
            }  

            const { occupiedIndexes, inventories } = await this.inventoryService.getParams({
                connection: this.connection,
                inventoryType,
                userId: user.id,
                session: mongoSession,
            })

            const { value: { inventoryCapacity } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

            try {
                // Subtract gold
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: totalCost
                })

                //update
                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...goldsChanged }
                )

                console.log("User updated", goldsChanged)

                //Save inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: inventoryCapacity,
                    quantity: request.quantity,
                    userId: user.id,
                    occupiedIndexes,
                    inToolbar: false
                })

                await this.connection.model<InventorySchema>(InventorySchema.name).create(createdInventories)
                for (const inventory of updatedInventories) {
                    await this.connection.model<InventorySchema>(InventorySchema.name).updateOne({
                        _id: inventory._id
                    }, inventory)
                }

                mongoSession.commitTransaction()

                return {}
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                mongoSession.abortTransaction()
                throw error
            }
        } finally {
            mongoSession.endSession()
        }
    }
}

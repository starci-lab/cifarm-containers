import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    DefaultInfo, InjectMongoose, InventoryKind, InventorySchema,
    InventoryTypeSchema,
    SupplySchema, SystemId, SystemRecord, SystemSchema, UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { BuySuppliesRequest, BuySuppliesResponse } from "./buy-supplies.dto"

@Injectable()
export class BuySuppliesService {
    private readonly logger = new Logger(BuySuppliesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async buySupplies(request: BuySuppliesRequest): Promise<BuySuppliesResponse> {
        this.logger.debug(
            `Buying supply for user ${request.userId}, id: ${request.supplyId}, quantity: ${request.quantity}`
        )

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            const supply = await this.connection.model<SupplySchema>(SupplySchema.name)
                .findById(createObjectId(request.supplyId))
                .session(mongoSession)

            if (!supply) throw new GrpcNotFoundException("Supply not found")
            if (!supply.availableInShop)
                throw new GrpcFailedPreconditionException("Supply not available in shop")

            const totalCost = supply.price * request.quantity

            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(request.userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            // Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            const { value: { storageCapacity } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

            // Get inventory type
            const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                .findById(createObjectId(request.supplyId))
                .session(mongoSession)

            if (!inventoryType) {
                throw new GrpcNotFoundException("Inventory type not found")
            }

            const { occupiedIndexes, inventories } = await this.inventoryService.getParams({
                connection: this.connection,
                inventoryType,
                userId: user.id,
                session: mongoSession
            })

            try {
                // Subtract gold
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: totalCost
                })

                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...goldsChanged }
                )

                // Save inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    quantity: request.quantity,
                    userId: user.id,
                    capacity: storageCapacity,
                    occupiedIndexes,
                    kind: InventoryKind.Storage
                })

                await this.connection.model<InventorySchema>(InventorySchema.name).create(createdInventories)
                for (const inventory of updatedInventories) {
                    await this.connection.model<InventorySchema>(InventorySchema.name).updateOne(
                        { _id: inventory._id },
                        inventory
                    )
                }

                await mongoSession.commitTransaction()
                return {}
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await mongoSession.abortTransaction()
                throw error
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}

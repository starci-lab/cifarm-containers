import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    DefaultInfo,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    KeyValueRecord,
    SystemId,
    SystemSchema,
    ToolSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { BuyToolRequest, BuyToolResponse } from "./buy-tool.dto"

@Injectable()
export class BuyToolService {
    private readonly logger = new Logger(BuyToolService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly inventoryService: InventoryService
    ) {}

    async buyTool({ toolId, userId }: BuyToolRequest): Promise<BuyToolResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async (mongoSesion) => {
                const {
                    value: { storageCapacity }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                    .session(mongoSesion)
                const tool = await this.connection
                    .model<ToolSchema>(ToolSchema.name)
                    .findById(createObjectId(toolId))
                    .session(mongoSesion)

                if (!tool) throw new GrpcNotFoundException("Tool not found")
                if (!tool.availableInShop)
                    throw new GrpcFailedPreconditionException("Tool not available in shop")

                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (!user) throw new GrpcNotFoundException("User not found")

                // Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: tool.price
                })

                // Deduct gold and update the user's gold balance
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: tool.price
                })

                // Update user's gold balance
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...goldsChanged }, { session: mongoSesion })

                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        type: InventoryType.Tool,
                        tool: tool.id
                    })
                    .session(mongoSesion)
                // Check if user has the tool already
                const userHasTool = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .exists({
                        user: userId,
                        inventoryType: inventoryType.id
                    })
                    .session(mongoSesion)

                if (userHasTool) {
                    throw new GrpcFailedPreconditionException("User already has the tool")
                }

                // Get the first unoccupied index
                const unoccupiedIndexes = await this.inventoryService.getUnoccupiedIndexes({
                    inventoryType,
                    userId,
                    connection: this.connection,
                    session: mongoSesion,
                    storageCapacity
                })
                const firstUnoccupiedIndex = unoccupiedIndexes[0]

                // Create a new inventory
                await this.connection.model<InventorySchema>(InventorySchema.name).create(
                    [
                        {
                            user: userId,
                            inventoryType: inventoryType.id,
                            index: firstUnoccupiedIndex,
                            kind: InventoryKind.Storage
                        }
                    ],
                    { session: mongoSesion }
                )

                return {} // Return an empty object (response)
            })

            return result // Return result from the transaction
        } catch (error) {
            this.logger.error(error)
            throw error // Rethrow error to be handled higher up
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}

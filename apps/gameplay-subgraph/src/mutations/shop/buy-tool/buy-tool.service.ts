import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyToolRequest } from "./buy-tool.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()   
export class BuyToolService {
    private readonly logger = new Logger(BuyToolService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly inventoryService: InventoryService,
        private readonly staticService: StaticService
    ) {}

    async buyTool(
        { id: userId }: UserLike,
        { toolId }: BuyToolRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        try {
            await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE TOOL
                 ************************************************************/
                const { storageCapacity } = this.staticService.defaultInfo
                const tool = this.staticService.tools.find(
                    (tool) => tool.displayId === toolId
                )
                if (!tool) {
                    throw new GraphQLError("Tool not found in static service", {
                        extensions: {
                            code: "TOOL_NOT_FOUND_IN_STATIC_SERVICE"
                        }
                    })
                }
                
                if (!tool.availableInShop) {
                    throw new GraphQLError("Tool not available in shop", {
                        extensions: {
                            code: "TOOL_NOT_AVAILABLE_IN_SHOP"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                // Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: tool.price
                })

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.type === InventoryType.Tool
                )

                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found in static service", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND_IN_STATIC_SERVICE"
                        }
                    })
                }

                // Check if user has the tool already
                const userHasTool = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .exists({
                        user: userId,
                        inventoryType: inventoryType.id
                    })
                    .session(mongoSession)

                if (userHasTool) {
                    throw new GraphQLError("User already has the tool", {
                        extensions: {
                            code: "USER_ALREADY_HAS_THE_TOOL"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Deduct gold
                this.goldBalanceService.subtract({
                    user,
                    amount: tool.price
                })

                // Save updated user data
                await user.save({ session: mongoSession })

                /************************************************************
                 * ADD TOOL TO INVENTORY
                 ************************************************************/
                // Get the first unoccupied index
                const unoccupiedIndexes = await this.inventoryService.getUnoccupiedIndexes({
                    inventoryType,
                    userId,
                    connection: this.connection,
                    session: mongoSession,
                    storageCapacity
                })
                
                if (unoccupiedIndexes.length === 0) {
                    throw new GraphQLError("No available inventory slots", {
                        extensions: {
                            code: "NO_AVAILABLE_INVENTORY_SLOTS"
                        }
                    })
                }
                
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
                    { session: mongoSession }
                )
            })
        } catch (error) {
            this.logger.error(error)
            // Rethrow error to be handled higher up
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}

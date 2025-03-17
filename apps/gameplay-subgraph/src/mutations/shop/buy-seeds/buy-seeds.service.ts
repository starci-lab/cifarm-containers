import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    CropSchema,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuySeedsRequest } from "./buy-seeds.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class BuySeedsService {
    private readonly logger = new Logger(BuySeedsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService
    ) {}

    async buySeeds(
        { id: userId }: UserLike,
        request: BuySeedsRequest
    ): Promise<void> {
        // Start session
        const session = await this.connection.startSession()
        
        try {
            await session.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE CROP
                 ************************************************************/
                const crop = await this.connection.model<CropSchema>(CropSchema.name)
                    .findById(createObjectId(request.cropId))
                    .session(session)

                if (!crop) {
                    throw new GraphQLError("Crop not found", {
                        extensions: {
                            code: "CROP_NOT_FOUND"
                        }
                    })
                }
                
                if (!crop.availableInShop) {
                    throw new GraphQLError("Crop not available in shop", {
                        extensions: {
                            code: "CROP_NOT_AVAILABLE_IN_SHOP"
                        }
                    })
                }
                
                const totalCost = crop.price * request.quantity

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                const user: UserSchema = await this.connection.model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                //Check sufficient gold
                this.goldBalanceService.checkSufficient({ 
                    current: user.golds, 
                    required: totalCost 
                })

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/
                //Get inventory type
                const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        type: InventoryType.Seed,
                        crop: createObjectId(request.cropId)
                    })
                    .session(session)

                if (!inventoryType) {
                    throw new GraphQLError("Inventory seed type not found", {
                        extensions: {
                            code: "INVENTORY_SEED_TYPE_NOT_FOUND"
                        }
                    })
                }  

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Subtract gold
                this.goldBalanceService.subtract({
                    user,
                    amount: totalCost
                })

                // Save updated user data
                await user.save({ session })

                /************************************************************
                 * ADD SEEDS TO INVENTORY
                 ************************************************************/
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session,
                })

                const { storageCapacity } = this.staticService.defaultInfo
                
                //Save inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity: request.quantity,
                    userId: user.id,
                    occupiedIndexes,
                    kind: InventoryKind.Storage,
                })

                // Create new inventory items
                if (createdInventories.length > 0) {
                    await this.connection.model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session })
                }
                
                // Update existing inventory items
                for (const inventory of updatedInventories) {
                    await this.connection.model<InventorySchema>(InventorySchema.name)
                        .updateOne(
                            { _id: inventory._id },
                            inventory
                        )
                        .session(session)
                }
            })
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await session.endSession()
        }
    }
}

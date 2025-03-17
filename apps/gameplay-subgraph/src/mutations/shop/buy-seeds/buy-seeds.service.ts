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
    ) {
    }

    async buySeeds(
        { id: userId }: UserLike,
        request: BuySeedsRequest
    ): Promise<void> {
        // Start session
        const mongoSession = await this.connection.startSession()
        
        try {
            await mongoSession.withTransaction(async () => {
                const crop = await this.connection.model<CropSchema>(CropSchema.name)
                    .findById(createObjectId(request.cropId))
                    .session(mongoSession)

                if (!crop) throw new GraphQLError("Crop not found", {
                    extensions: {
                        code: "CROP_NOT_FOUND",
                    }
                })
                if (!crop.availableInShop) throw new GraphQLError("Crop not available in shop", {
                    extensions: {
                        code: "CROP_NOT_AVAILABLE_IN_SHOP",
                    }
                })
                const totalCost = crop.price * request.quantity

                const user: UserSchema = await this.connection.model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                //Check sufficient gold
                this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

                // Subtract gold
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: totalCost
                })

                //update
                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...goldsChanged },
                    { session: mongoSession }
                )

                //Get inventory type
                const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).findOne({
                    type: InventoryType.Seed,
                    crop: createObjectId(request.cropId)
                }).session(mongoSession)

                if (!inventoryType) {
                    throw new GraphQLError("Inventory seed type not found", {
                        extensions: {
                            code: "INVENTORY_SEED_TYPE_NOT_FOUND",
                        }
                    })
                }  

                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session: mongoSession,
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

                await this.connection.model<InventorySchema>(InventorySchema.name).create(createdInventories, { session: mongoSession })
                for (const inventory of updatedInventories) {
                    await this.connection.model<InventorySchema>(InventorySchema.name).updateOne({
                        _id: inventory._id
                    }, inventory).session(mongoSession)
                }
                // No return value needed for void
            })
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

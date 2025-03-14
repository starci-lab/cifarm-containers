import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    CropSchema,
    DefaultInfo,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    SystemId,
    KeyValueRecord,
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
        // Start session
        const mongoSession = await this.connection.startSession()
        
        try {
            const result = await mongoSession.withTransaction(async () => {
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
                    throw new GrpcNotFoundException("Inventory seed type not found")
                }  

                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session: mongoSession,
                })

                const { value: { storageCapacity } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                
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
                return {}
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

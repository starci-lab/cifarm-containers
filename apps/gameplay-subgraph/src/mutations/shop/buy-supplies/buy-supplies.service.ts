import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    DefaultInfo, InjectMongoose, InventoryKind, InventorySchema,
    InventoryTypeSchema,
    SupplySchema, SystemId, KeyValueRecord, SystemSchema, UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuySuppliesRequest } from "./buy-supplies.dto"
import { UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"   

@Injectable()
export class BuySuppliesService {
    private readonly logger = new Logger(BuySuppliesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async buySupplies(
        { id: userId }: UserLike,
        { quantity, supplyId }: BuySuppliesRequest
    ): Promise<EmptyObjectType> { 
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async () => {
                const supply = await this.connection.model<SupplySchema>(SupplySchema.name)
                    .findById(createObjectId(supplyId))
                    .session(mongoSession)

                if (!supply) throw new NotFoundException("Supply not found")
                if (!supply.availableInShop)
                    throw new BadRequestException("Supply not available in shop")

                const totalCost = supply.price * quantity

                const user = await this.connection.model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                // Check sufficient gold
                this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

                // Subtract gold
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: totalCost
                })

                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...goldsChanged },
                    { session: mongoSession }
                )

                const { value: { storageCapacity } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

                // Get inventory type
                const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findById(createObjectId(supplyId))
                    .session(mongoSession)

                if (!inventoryType) {
                    throw new NotFoundException("Inventory type not found")
                }

                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session: mongoSession
                })
                
                // Save inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    quantity,
                    userId: user.id,
                    capacity: storageCapacity,
                    occupiedIndexes,
                    kind: InventoryKind.Storage
                })

                await this.connection.model<InventorySchema>(InventorySchema.name).create(createdInventories, { session: mongoSession })
                for (const inventory of updatedInventories) {
                    await this.connection.model<InventorySchema>(InventorySchema.name).updateOne(
                        { _id: inventory._id },
                        inventory
                    ).session(mongoSession)
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

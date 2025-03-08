import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { 
    ActivityInfo, 
    InjectMongoose, 
    PlacedItemSchema, 
    SEED_GROWTH_INFO, 
    SystemId, 
    KeyValueRecord, 
    SystemSchema, 
    UserSchema, 
    InventorySchema, 
    InventoryTypeSchema, 
    InventoryTypeId, 
    InventoryType, 
    Activities
} from "@src/databases"
import { EnergyService, LevelService, InventoryService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UseFertilizerRequest, UseFertilizerResponse } from "./use-fertilizer.dto"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class UseFertilizerService {
    private readonly logger = new Logger(UseFertilizerService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

    async useFertilizer({ inventorySupplyId, placedItemTileId, userId }: UseFertilizerRequest): Promise<UseFertilizerResponse> {
        this.logger.debug(`Applying fertilizer for user ${userId}, tile ID: ${placedItemTileId}`)

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            const inventory = await this.connection.model<InventorySchema>(InventorySchema.name)
                .findById(inventorySupplyId)
                .session(mongoSession)

            const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                .findById(inventory.inventoryType)
                .session(mongoSession)

            const placedItemTile = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(placedItemTileId)
                .populate(SEED_GROWTH_INFO)
                .session(mongoSession)

            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")
            if (!placedItemTile.seedGrowthInfo) throw new GrpcNotFoundException("Tile is not planted")
            if (placedItemTile.seedGrowthInfo.isFertilized) throw new GrpcFailedPreconditionException("Tile is already fertilized")

            const { value: { useFertilizer: { energyConsume, experiencesGain } } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))

            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            if (!inventoryType || inventoryType.type !== InventoryType.Supply) throw new GrpcFailedPreconditionException("Inventory type is not supply")
            if (inventoryType.displayId !== InventoryTypeId.BasicFertilizer) throw new GrpcFailedPreconditionException("Inventory supply is not BasicFertilizer")

            const energyChanges = this.energyService.substract({ user, quantity: energyConsume })
            const experienceChanges = this.levelService.addExperiences({ user, experiences: experiencesGain })

            await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                { _id: user.id },
                { ...energyChanges, ...experienceChanges }
            ).session(mongoSession)

            const { inventories } = await this.inventoryService.getRemoveParams({
                connection: this.connection,
                userId: user.id,
                session: mongoSession,
                inventoryType,
                kind: inventory.kind
            })
            const { removedInventories, updatedInventories } = this.inventoryService.remove({
                inventories,
                quantity: 1,
            })

            for (const inventory of updatedInventories) {
                await this.connection.model<InventorySchema>(InventorySchema.name).updateOne(
                    { _id: inventory._id },
                    inventory
                ).session(mongoSession)
            }
            await this.connection.model<InventorySchema>(InventorySchema.name).deleteMany({
                _id: { $in: removedInventories.map(inventory => inventory._id) }
            }).session(mongoSession)

            placedItemTile.seedGrowthInfo.isFertilized = true
            await placedItemTile.save({
                session: mongoSession
            })

            this.clientKafka.emit(KafkaPattern.SyncPlacedItems, {
                userId
            })

            await mongoSession.commitTransaction()
            return {}
        } catch (error) {
            this.logger.error(`Transaction failed, reason: ${error.message}`)
            await mongoSession.abortTransaction()
            throw new GrpcInternalException(error.message)
        } finally {
            await mongoSession.endSession()
        }
    }
}

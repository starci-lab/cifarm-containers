import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { Activities, CropCurrentState, CropSchema, InjectMongoose, InventorySchema, InventoryTypeSchema, PlacedItemSchema, SystemId, KeyValueRecord, SystemSchema, UserSchema } from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { PlantSeedRequest, PlantSeedResponse } from "./plant-seed.dto"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"

@Injectable()
export class PlantSeedService {
    private readonly logger = new Logger(PlantSeedService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

    async plantSeed({ inventorySeedId, placedItemTileId, userId}: PlantSeedRequest): Promise<PlantSeedResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        let actionMessage: EmitActionPayload | undefined
        try {
            const inventory = await this.connection.model<InventorySchema>(InventorySchema.name)
                .findById(inventorySeedId)
                .session(mongoSession)

            const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                .findById(inventory.inventoryType)
                .session(mongoSession)

            const placedItemTile = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(placedItemTileId)
                .session(mongoSession)

            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")
            if (placedItemTile.user.toString() !== userId) throw new GrpcFailedPreconditionException("Cannot plant seed on other's tile")
            if (placedItemTile.seedGrowthInfo) throw new GrpcFailedPreconditionException("Tile is already planted")

            const { value: { plantSeed: { energyConsume, experiencesGain } } } = await this.connection
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

            const energyChanges = this.energyService.substract({ user, quantity: energyConsume })
            const experiencesChanges = this.levelService.addExperiences({ user, experiences: experiencesGain })

            const crop = await this.connection.model<CropSchema>(CropSchema.name)
                .findById(inventoryType.crop)
                .session(mongoSession)

            if (!crop) throw new GrpcNotFoundException("Crop not found")

            await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                { _id: user.id },
                { ...energyChanges, ...experiencesChanges }
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

            await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne(
                { _id: placedItemTile._id },
                { seedGrowthInfo: {
                    crop: crop.id,
                    harvestQuantityRemaining: crop.maxHarvestQuantity,
                    currentState: CropCurrentState.Normal,
                }}
            ).session(mongoSession)

            await mongoSession.commitTransaction()

            actionMessage = {
                placedItemId: placedItemTileId,
                action: ActionName.PlantSeed,
                success: true,
                userId,
            }
            this.clientKafka.emit(KafkaPattern.EmitAction, actionMessage)
            this.clientKafka.emit(KafkaPattern.SyncPlacedItems, { userId })
            return {}      
        } catch (error) 
        {
            if (actionMessage)
            {
                this.clientKafka.emit(KafkaPattern.EmitAction, actionMessage)
            }  
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

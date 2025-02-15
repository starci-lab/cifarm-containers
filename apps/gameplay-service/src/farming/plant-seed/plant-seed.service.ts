import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { ActivityInfo, CropCurrentState, CropSchema, InjectMongoose, InventorySchema, InventoryTypeSchema, PlacedItemSchema, SEED_GROWTH_INFO, SystemId, SystemRecord, SystemSchema, UserSchema } from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { PlantSeedRequest, PlantSeedResponse } from "./plant-seed.dto"

@Injectable()
export class PlantSeedService {
    private readonly logger = new Logger(PlantSeedService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService
    ) {}

    async plantSeed(request: PlantSeedRequest): Promise<PlantSeedResponse> {
        this.logger.debug(`Planting seed for user ${request.userId}, tile ID: ${request.placedItemTileId}`)

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            const inventory = await this.connection.model<InventorySchema>(InventorySchema.name)
                .findById(request.inventorySeedId)
                .session(mongoSession)

            const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                .findById(inventory.inventoryType)
                .session(mongoSession)

            const placedItemTile = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(request.placedItemTileId)
                .populate(SEED_GROWTH_INFO)
                .session(mongoSession)

            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")
            if (placedItemTile.seedGrowthInfo) throw new GrpcFailedPreconditionException("Tile is already planted")

            const { value: { energyConsume, experiencesGain } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<ActivityInfo>>(createObjectId(SystemId.Activities))

            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(request.userId)
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

            try {
                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...energyChanges, ...experiencesChanges }
                )

                const updatedQuantity = inventory.quantity - 1
                if (updatedQuantity === 0) {
                    await this.connection.model<InventorySchema>(InventorySchema.name).deleteOne({ _id: inventory.id })
                } else {
                    await this.connection.model<InventorySchema>(InventorySchema.name).updateOne(
                        { _id: inventory.id },
                        { quantity: updatedQuantity }
                    )
                }

                await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne(
                    { _id: placedItemTile._id },
                    { seedGrowthInfo: {
                        cropId: crop.id,
                        harvestQuantityRemaining: crop.maxHarvestQuantity,
                        currentState: CropCurrentState.Normal
                    }}
                )

                await mongoSession.commitTransaction()
                return {}
            } catch (error) {
                this.logger.error(`Transaction failed, reason: ${error.message}`)
                await mongoSession.abortTransaction()
                throw new GrpcInternalException(error.message)
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}

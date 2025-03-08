import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import {
    Activities,
    CROP,
    CropCurrentState,
    CropRandomness,
    CropSchema,
    DefaultInfo,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    KeyValueRecord,
    PlacedItemSchema,
    ProductSchema,
    ProductType,
    SystemId,
    SystemSchema,
    UserSchema,
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, ThiefService } from "@src/gameplay"
import { ThiefCropRequest, ThiefCropResponse } from "./thief-crop.dto"
import { Connection } from "mongoose"
import { GrpcInvalidArgumentException } from "nestjs-grpc-exceptions"
import { createObjectId } from "@src/common"

@Injectable()
export class ThiefCropService {
    private readonly logger = new Logger(ThiefCropService.name)
    constructor(
        @InjectKafka()
        private readonly clientKafka: ClientKafka,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly thiefService: ThiefService,
        private readonly inventoryService: InventoryService
    ) {}

    async thiefCrop({ placedItemTileId, userId}: ThiefCropRequest): Promise<ThiefCropResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const placedItemTile = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(placedItemTileId)
                .session(mongoSession)

            if (!placedItemTile) {
                throw new GrpcInvalidArgumentException("Tile not found")
            }

            const neighborUserId = placedItemTile.user.toString()
            if (neighborUserId === userId) {
                throw new GrpcInvalidArgumentException("Cannot thief from your own tile")
            }
            if (!placedItemTile.seedGrowthInfo) {
                throw new GrpcInvalidArgumentException("Tile is not planted")
            }
            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.FullyMatured) {
                throw new GrpcInvalidArgumentException("Crop is not fully matured")
            }

            const { value: { thiefCrop: { energyConsume, experiencesGain } } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                .session(mongoSession)

            const user = await this.connection
                .model<UserSchema>(UserSchema.name).findById(userId)
                .session(mongoSession)

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            const energyChanges = this.energyService.substract({
                user,
                quantity: energyConsume
            })

            const experienceChanges = this.levelService.addExperiences({
                user,
                experiences: experiencesGain
            })

            //crop randomness
            const { value: { thief2, thief3 } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<CropRandomness>>(createObjectId(SystemId.CropRandomness))
                .session(mongoSession)

            const product = await this.connection
                .model<ProductSchema>(ProductSchema.name)
                .findOne({
                    type: ProductType.Crop,
                    crop: placedItemTile.seedGrowthInfo.crop,
                }).populate(CROP).session(mongoSession)

            const crop = product.crop as CropSchema

            const { value: computedQuantity } = this.thiefService.compute({
                thief2,
                thief3
            })

            const actualQuantity = Math.min(
                computedQuantity,
                placedItemTile.seedGrowthInfo.harvestQuantityRemaining - crop.minHarvestQuantity
            )

            const inventoryType = await this.connection
                .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                .findOne({
                    type: InventoryType.Product,
                    product: product.id
                })
                .session(mongoSession)
            
            const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                connection: this.connection,
                inventoryType,
                userId: user.id,
                session: mongoSession
            })

            const {
                value: { storageCapacity }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

            const { createdInventories, updatedInventories } = this.inventoryService.add({
                inventoryType,
                inventories,
                capacity: storageCapacity,
                quantity: actualQuantity,
                userId: user.id,
                occupiedIndexes
            })

            await this.connection
                .model<InventorySchema>(InventorySchema.name)
                .create(createdInventories, { session: mongoSession })
            for (const inventory of updatedInventories) {
                await this.connection.model<InventorySchema>(InventorySchema.name).updateOne(
                    { _id: inventory._id },
                    inventory
                ).session(mongoSession)
            }

            await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                { _id: user.id },
                { ...energyChanges, ...experienceChanges }
            ).session(mongoSession)

            placedItemTile.seedGrowthInfo.harvestQuantityRemaining = placedItemTile.seedGrowthInfo.harvestQuantityRemaining - actualQuantity
            await placedItemTile.save({ session: mongoSession })

            await mongoSession.commitTransaction()

            this.clientKafka.emit(KafkaPattern.SyncPlacedItems, {
                userId: neighborUserId
            })

            return { quantity: actualQuantity }
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

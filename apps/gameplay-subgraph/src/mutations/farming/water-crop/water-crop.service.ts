import { Injectable, Logger } from "@nestjs/common"
import {
    CropCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, LevelService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { WaterCropRequest } from "./water-crop.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class WaterCropService {
    private readonly logger = new Logger(WaterCropService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer()
        private readonly producer: Producer
    ) {}

    async water({ id: userId }: UserLike, { placedItemTileId }: WaterCropRequest): Promise<void> {
        let actionMessage: EmitActionPayload | undefined
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to automatically handle session and transaction
            await mongoSession.withTransaction(async (mongoSession) => {
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(mongoSession)

                if (!placedItemTile) {
                    actionMessage = {
                        placedItemId: placedItemTileId,
                        action: ActionName.WaterCrop,
                        success: false,
                        userId,
                        reasonCode: 0
                    }
                    throw new GraphQLError("Tile not found", {
                        extensions: {
                            code: "TILE_NOT_FOUND"
                        }
                    })
                }

                if (placedItemTile.user.toString() !== userId) {
                    throw new GraphQLError("Cannot use water on other's tile", {
                        extensions: {
                            code: "UNAUTHORIZED_WATERING"
                        }
                    })
                }

                if (!placedItemTile.seedGrowthInfo) {
                    actionMessage = {
                        placedItemId: placedItemTileId,
                        action: ActionName.WaterCrop,
                        success: false,
                        userId,
                        reasonCode: 1
                    }
                    throw new GraphQLError("Tile is not planted", {
                        extensions: {
                            code: "TILE_NOT_PLANTED"
                        }
                    })
                }

                if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.NeedWater) {
                    actionMessage = {
                        placedItemId: placedItemTileId,
                        action: ActionName.WaterCrop,
                        success: false,
                        userId,
                        reasonCode: 2
                    }
                    throw new GraphQLError("Tile does not need water", {
                        extensions: {
                            code: "TILE_DOES_NOT_NEED_WATER"
                        }
                    })
                }

                const { energyConsume, experiencesGain } = this.staticService.activities.waterCrop

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

                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...energyChanges, ...experienceChanges })
                    .session(mongoSession)

                placedItemTile.seedGrowthInfo.currentState = CropCurrentState.Normal
                await placedItemTile.save({ session: mongoSession })

                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.WaterCrop,
                    success: true,
                    userId
                }

                // No return value needed for void
            })

            await Promise.all([
                this.producer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId }) }]
                }),
                this.producer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            ])

            // No return value needed for void
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                await this.producer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }
            throw error // Re-throwing the error after logging and handling the action message
        } finally {
            await mongoSession.endSession()
        }
    }
}

import { Injectable, Logger } from "@nestjs/common"
import {
    CropCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { UsePesticideRequest } from "./use-pesticide.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class UsePesticideService {
    private readonly logger = new Logger(UsePesticideService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async usePesticide(
        { id: userId }: UserLike,
        { placedItemTileId }: UsePesticideRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload | undefined

        try {
            await mongoSession.withTransaction(async (session) => {
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)

                if (!placedItemTile) {
                    actionMessage = {
                        placedItemId: placedItemTileId,
                        action: ActionName.UsePesticide,
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
                    throw new GraphQLError("Cannot use pesticide on other's tile", {
                        extensions: {
                            code: "UNAUTHORIZED_PESTICIDE"
                        }
                    })
                }

                if (!placedItemTile.seedGrowthInfo) {
                    throw new GraphQLError("Tile is not planted", {
                        extensions: {
                            code: "TILE_NOT_PLANTED"
                        }
                    })
                }

                if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsInfested) {
                    throw new GraphQLError("Tile is not infested", {
                        extensions: {
                            code: "TILE_NOT_INFESTED"
                        }
                    })
                }

                const { energyConsume, experiencesGain } = this.staticService.activities.usePesticide

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

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
                    .session(session)

                placedItemTile.seedGrowthInfo.currentState = CropCurrentState.Normal
                await placedItemTile.save({ session })

                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.UsePesticide,
                    success: true,
                    userId
                }
            })

            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId }) }]
                })
            ])
        } catch (error) {
            this.logger.error(`Transaction failed, reason: ${error.message}`)

            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

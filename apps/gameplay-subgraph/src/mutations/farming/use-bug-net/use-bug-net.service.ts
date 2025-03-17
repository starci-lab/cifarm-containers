import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    FruitCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryTypeId,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { UseBugNetRequest } from "./use-bug-net.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class UseBugNetService {
    private readonly logger = new Logger(UseBugNetService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async useBugNet(
        { id: userId }: UserLike,
        { placedItemFruitId }: UseBugNetRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload | undefined

        try {
            await mongoSession.withTransaction(async (session) => {
                const inventoryTypeBugNet = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.displayId === InventoryTypeId.BugNet
                )
                if (!inventoryTypeBugNet) {
                    throw new GraphQLError("Bug net not found from static data", {
                        extensions: {
                            code: "BUG_NET_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }
                
                const hasInventoryBugNet = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .exists({
                        user: userId,
                        inventoryType: inventoryTypeBugNet.id
                    })
                    .session(session)
                if (!hasInventoryBugNet) {
                    throw new GraphQLError("Bug net not found", {
                        extensions: {
                            code: "BUG_NET_NOT_FOUND"
                        }
                    })
                }

                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .session(session)

                if (!placedItemFruit) {
                    actionMessage = {
                        placedItemId: placedItemFruitId,
                        action: ActionName.UseBugNet,
                        success: false,
                        userId,
                        reasonCode: 0
                    }
                    throw new GraphQLError("Fruit not found", {
                        extensions: {
                            code: "FRUIT_NOT_FOUND"
                        }
                    })
                }

                if (placedItemFruit.user.toString() !== userId) {
                    throw new GraphQLError("Cannot use bug net on other's tile", {
                        extensions: {
                            code: "CANNOT_USE_BUG NET_ON_OTHERS_TILE"
                        }
                    })
                }

                if (!placedItemFruit.fruitInfo) {
                    throw new GraphQLError("Fruit is not planted", {
                        extensions: {
                            code: "FRUIT_NOT_PLANTED"
                        }
                    })
                }

                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.IsInfested) {
                    throw new GraphQLError("Fruit is not weedy", {
                        extensions: {
                            code: "FRUIT_NOT_INFESTED"
                        }
                    })
                }

                const { energyConsume, experiencesGain } = this.staticService.activities.useBugNet

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

                this.energyService.substract({
                    user,
                    quantity: energyConsume
                })
                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal

                actionMessage = {
                    placedItemId: placedItemFruitId,
                    action: ActionName.UseBugNet,
                    success: true,
                    userId
                }

                await placedItemFruit.save({ session })
                await user.save({ session })
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
            this.logger.error(error)

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

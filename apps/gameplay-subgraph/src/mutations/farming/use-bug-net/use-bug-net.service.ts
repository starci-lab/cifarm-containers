import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    FruitCurrentState,
    InjectMongoose,
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
                    throw new GraphQLError("Cannot use bugnet on other's tile", {
                        extensions: {
                            code: "UNAUTHORIZED_BUGNET"
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

                if (!user) throw new GraphQLError("User not found", {
                    extensions: {
                        code: "USER_NOT_FOUND"
                    }
                })

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

                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
                await placedItemFruit.save({ session })

                actionMessage = {
                    placedItemId: placedItemFruitId,
                    action: ActionName.UseBugNet,
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

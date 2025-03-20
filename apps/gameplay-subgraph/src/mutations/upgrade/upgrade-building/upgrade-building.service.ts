import { Injectable, Logger } from "@nestjs/common"
import { GoldBalanceService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { UpgradeBuildingRequest } from "./upgrade-building.dto"
import { PlacedItemSchema, UserSchema, InjectMongoose } from "@src/databases"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { KafkaTopic } from "@src/brokers"
import { InjectKafkaProducer } from "@src/brokers"
import { Producer } from "kafkajs"

@Injectable()
export class UpgradeBuildingService {
    private readonly logger = new Logger(UpgradeBuildingService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async upgradeBuilding(
        { id: userId }: UserLike,
        { placedItemBuildingId }: UpgradeBuildingRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        let user: UserSchema | undefined
        try {
            await mongoSession.withTransaction(async () => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM
                 ************************************************************/
                const placedItemBuilding = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemBuildingId)
                    .session(mongoSession)

                if (!placedItemBuilding) {
                    throw new GraphQLError("Placed item not found", {
                        extensions: {
                            code: "PLACED_ITEM_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE BUILDING TYPE
                 ************************************************************/
                const building = this.staticService.buildings.find(
                    (building) => building.id === placedItemBuilding.placedItemType.toString()
                )   
                if (!building) {
                    throw new GraphQLError("Building type not found in static data", {
                        extensions: {
                            code: "BUILDING_TYPE_NOT_FOUND_IN_STATIC"
                        }
                    })
                }

                /************************************************************
                 * CHECK UPGRADE AVAILABILITY
                 ************************************************************/
                const currentUpgradeLevel = placedItemBuilding.buildingInfo.currentUpgrade

                if (currentUpgradeLevel > building.maxUpgrade) {
                    throw new GraphQLError("Building already at max upgrade level", {
                        extensions: {
                            code: "BUILDING_MAX_LEVEL"
                        }
                    })
                }

                const nextUpgrade = building.upgrades.find(
                    (upgrade) => upgrade.upgradeLevel === currentUpgradeLevel + 1
                )

                if (!nextUpgrade) {
                    throw new GraphQLError("Next upgrade not found", {
                        extensions: {
                            code: "NEXT_UPGRADE_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                user = await this.connection
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

                /************************************************************
                 * CHECK SUFFICIENT GOLD
                 ************************************************************/
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: nextUpgrade.upgradePrice
                })

                /************************************************************
                 * UPDATE USER GOLD
                 ************************************************************/
                this.goldBalanceService.subtract({
                    user: user,
                    amount: nextUpgrade.upgradePrice
                })

                await user.save({ session: mongoSession })

                /************************************************************
                 * UPDATE BUILDING UPGRADE LEVEL
                 ************************************************************/
                placedItemBuilding.buildingInfo.currentUpgrade = currentUpgradeLevel + 1
                await placedItemBuilding.save({ session: mongoSession })
            })
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [{ value: JSON.stringify({ userId, user: user.toJSON() }) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId }) }]
                })
            ])
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

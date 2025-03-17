import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { UpgradeBuildingRequest } from "./upgrade-building.dto"
import { PlacedItemSchema, BuildingSchema, UserSchema } from "@src/databases"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class UpgradeBuildingService {
    private readonly logger = new Logger(UpgradeBuildingService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async upgradeBuilding(
        { id: userId }: UserLike,
        { placedItemBuildingId }: UpgradeBuildingRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        try {
            await mongoSession.withTransaction(async () => {
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

                const building = await this.connection
                    .model<BuildingSchema>(BuildingSchema.name)
                    .findById(placedItemBuilding.placedItemType)
                    .session(mongoSession)

                if (!building) {
                    throw new GraphQLError("Building type not found", {
                        extensions: {
                            code: "BUILDING_TYPE_NOT_FOUND"
                        }
                    })
                }

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

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)
                    
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: nextUpgrade.upgradePrice
                })

                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: nextUpgrade.upgradePrice
                })

                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...goldsChanged })

                await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .updateOne(
                        { _id: placedItemBuilding._id },
                        { "buildingInfo.currentUpgrade": currentUpgradeLevel + 1 }
                    )
                // No return value needed for void
            })
            // No return value needed for void
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

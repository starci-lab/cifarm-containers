import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UpgradeBuildingRequest, UpgradeBuildingResponse } from "./upgrade-building.dto"
import { PlacedItemSchema, BuildingSchema, UserSchema } from "@src/databases"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class UpgradeBuildingService {
    private readonly logger = new Logger(UpgradeBuildingService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async upgradeBuilding(request: UpgradeBuildingRequest): Promise<UpgradeBuildingResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async () => {
                const placedItemBuilding = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(request.placedItemBuildingId)
                    .session(mongoSession)

                if (!placedItemBuilding) {
                    throw new GrpcNotFoundException("Placed item not found")
                }

                const building = await this.connection.model<BuildingSchema>(BuildingSchema.name)
                    .findById(placedItemBuilding.placedItemType)
                    .session(mongoSession)

                if (!building) {
                    throw new GrpcNotFoundException("Building type not found")
                }

                const currentUpgradeLevel = placedItemBuilding.buildingInfo.currentUpgrade

                if (currentUpgradeLevel > building.maxUpgrade) {
                    throw new GrpcFailedPreconditionException("Building already at max upgrade level")
                }

                const nextUpgrade = building.upgrades.find(upgrade => upgrade.upgradeLevel === currentUpgradeLevel + 1)

                if (!nextUpgrade) {
                    throw new GrpcFailedPreconditionException("Next upgrade not found")
                }

                const user = await this.connection.model<UserSchema>(UserSchema.name)
                    .findById(request.userId)
                    .session(mongoSession)

                if (!user) {
                    throw new GrpcNotFoundException("User not found")
                }

                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: nextUpgrade.upgradePrice
                })

                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: nextUpgrade.upgradePrice
                })

                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...goldsChanged }
                )

                await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne(
                    { _id: placedItemBuilding._id },
                    { "buildingInfo.currentUpgrade": currentUpgradeLevel + 1 }
                )
                return {}
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

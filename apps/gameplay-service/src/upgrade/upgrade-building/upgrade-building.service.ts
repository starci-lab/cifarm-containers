import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { UpgradeBuildingRequest, UpgradeBuildingResponse } from "./upgrade-building.dto"

@Injectable()
export class UpgradeBuildingService {
    private readonly logger = new Logger(UpgradeBuildingService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async upgradeBuilding(request: UpgradeBuildingRequest): Promise<UpgradeBuildingResponse> {
        this.logger.debug(`Upgrading building for user ${request.userId}, building ID: ${request.placedItemBuildingId}`)

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            // const placedItemBuilding = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
            //     .findById(request.placedItemBuildingId)
            //     .session(mongoSession)

            // if (!placedItemBuilding) {
            //     throw new GrpcNotFoundException("Placed item not found")
            // }

            // const building = await this.connection.model<BuildingSchema>(BuildingSchema.name)
            //     .findById(createObjectId(placedItemBuilding.placedItemType))
            //     .session(mongoSession)

            // if (!building) {
            //     throw new GrpcNotFoundException("Building type not found")
            // }

            // const currentUpgradeLevel = placedItemBuilding.buildingInfo.currentUpgrade

            // if (currentUpgradeLevel >= building.maxUpgradeLevel) {
            //     throw new GrpcFailedPreconditionException("Building already at max upgrade level")
            // }

            // const nextUpgrade = building.upgrades.find(upgrade => upgrade.upgradeLevel === currentUpgradeLevel + 1)

            // if (!nextUpgrade) {
            //     throw new GrpcFailedPreconditionException("Next upgrade not found")
            // }

            // const user = await this.connection.model<UserSchema>(UserSchema.name)
            //     .findById(request.userId)
            //     .session(mongoSession)

            // if (!user) {
            //     throw new GrpcNotFoundException("User not found")
            // }

            // this.goldBalanceService.checkSufficient({
            //     current: user.golds,
            //     required: nextUpgrade.upgradePrice
            // })

            // try {
            //     const goldsChanged = this.goldBalanceService.subtract({
            //         user: user,
            //         amount: nextUpgrade.upgradePrice
            //     })

            //     await this.connection.model<UserSchema>(UserSchema.name).updateOne(
            //         { _id: user.id },
            //         { ...goldsChanged }
            //     )

            //     await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne(
            //         { _id: placedItemBuilding._id },
            //         { "buildingInfo.currentUpgrade": currentUpgradeLevel + 1 }
            //     )

            //     await mongoSession.commitTransaction()
            return {}
            // } catch (error) {
            //     this.logger.error(`Transaction failed, reason: ${error.message}`)
            //     await mongoSession.abortTransaction()
            //     throw error
            // }
        } finally {
            await mongoSession.endSession()
        }
    }
}

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
        // const queryRunner = this.dataSource.createQueryRunner()
        // await queryRunner.connect()

        // try {
        //     // Fetch placed item
        //     const placedItemBuilding = await queryRunner.manager.findOne(PlacedItemSchema, {
        //         where: { id: request.placedItemBuildingId, userId: request.userId },
        //         relations: {
        //             buildingInfo: true,
        //             placedItemType: {
        //                 building: {
        //                     upgrades: true
        //                 }
        //             }
        //         }
        //     })

        //     if (!placedItemBuilding) {
        //         throw new GrpcNotFoundException("Placed item not found")
        //     }

        //     const currentUpgradeLevel = placedItemBuilding.buildingInfo.currentUpgrade

        //     const maxUpgradeLevel = Math.max(
        //         ...placedItemBuilding.placedItemType.building.upgrades.map(
        //             (upgrade) => upgrade.upgradeLevel
        //         )
        //     )

        //     if (currentUpgradeLevel === maxUpgradeLevel) {
        //         throw new GrpcFailedPreconditionException("Building already at max upgrade level")
        //     }

        //     // Fetch the next upgrade level
        //     const nextUpgrade = placedItemBuilding.placedItemType.building.upgrades.find(
        //         (upgrade) => upgrade.upgradeLevel === currentUpgradeLevel + 1
        //     )

        //     if (!nextUpgrade) {
        //         throw new GrpcFailedPreconditionException("Next upgrade not found")
        //     }

        //     // get user
        //     const user = await queryRunner.manager.findOne(UserSchema, {
        //         where: { id: request.userId }
        //     })

        //     // Check sufficient gold
        //     this.goldBalanceService.checkSufficient({
        //         current: user.golds,
        //         required: nextUpgrade.upgradePrice
        //     })

        //     // Update building upgrade level
        //     placedItemBuilding.buildingInfo.currentUpgrade = currentUpgradeLevel + 1

        //     // Start transaction
        //     await queryRunner.startTransaction()
        //     try {
        //         // Deduct gold
        //         const goldsChanged = this.goldBalanceService.subtract({
        //             entity: user,
        //             amount: nextUpgrade.upgradePrice
        //         })
        //         await queryRunner.manager.update(UserSchema, user.id, {
        //             ...goldsChanged
        //         })

        //         await queryRunner.manager.save(PlacedItemSchema, placedItemBuilding)

        //         await queryRunner.commitTransaction()
        //     } catch (error) {
        //         const errorMessage = `Transaction failed, reason: ${error.message}`
        //         this.logger.error(errorMessage)
        //         await queryRunner.rollbackTransaction()
        //         throw new GrpcInternalException(errorMessage)
        //     }
        //     return {}
        // } finally {
        //     await queryRunner.release()
        // }
        return {}
    }
}

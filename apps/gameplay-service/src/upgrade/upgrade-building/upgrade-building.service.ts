import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, PlacedItemEntity, UserEntity } from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { UpgradeBuildingRequest, UpgradeBuildingResponse } from "./upgrade-building.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class UpgradeBuildingService {
    private readonly logger = new Logger(UpgradeBuildingService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService
    ) {
    }

    async upgradeBuilding(request: UpgradeBuildingRequest): Promise<UpgradeBuildingResponse> {
        this.logger.debug(
            `Starting upgrade for placedItem ${request.placedItemBuildingId} by user ${request.userId}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Fetch placed item
            const placedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: request.placedItemBuildingId, userId: request.userId },
                relations: {
                    buildingInfo: {
                        building: {
                            upgrades: true,
                        }
                    }
                },
            })

            if (!placedItem) {
                throw new GrpcNotFoundException("Placed item not found")
            }

            const buildingInfo = placedItem.buildingInfo

            if (!buildingInfo) {
                throw new GrpcFailedPreconditionException("Building info not found")
            }

            const currentUpgradeLevel = buildingInfo.currentUpgrade

            const maxUpgradeLevel = Math.max(
                ...buildingInfo.building.upgrades.map((upgrade) => upgrade.upgradeLevel)
            )

            if (currentUpgradeLevel === maxUpgradeLevel) {
                throw new GrpcFailedPreconditionException("Building already at max upgrade level")
            }

            // Fetch the next upgrade level
            const nextUpgrade = buildingInfo.building.upgrades.find(
                (upgrade) => upgrade.upgradeLevel === currentUpgradeLevel + 1
            )

            if (!nextUpgrade) {
                throw new GrpcFailedPreconditionException("Next upgrade not found")
            }

            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId },
            })

            if (!user) {
                throw new GrpcNotFoundException("User not found")
            }

            // Check sufficient gold
            this.goldBalanceService.checkSufficient({
                current: user.golds,
                required: nextUpgrade.upgradePrice,
            })

            // Update building upgrade level
            buildingInfo.currentUpgrade = currentUpgradeLevel + 1

            // Start transaction
            await queryRunner.startTransaction()
            try {
                // Deduct gold
                const goldsChanged = this.goldBalanceService.subtract({
                    entity: user,
                    amount: nextUpgrade.upgradePrice,
                })
                await queryRunner.manager.update(UserEntity, user.id, {
                    ...goldsChanged,
                })
                
                await queryRunner.manager.save(PlacedItemEntity, placedItem)

                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}

import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, PlacedItemEntity, UserEntity } from "@src/databases"
import {
    BuildingAlreadyMaxUpgradeException,
    BuildingNextUpgradeNotFoundException,
    PlacedItemNotFoundException,
    UpgradeBuildingTransactionFailedException,
    UserNotFoundException,
} from "@src/exceptions"
import { GoldBalanceService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { UpgradeBuildingRequest, UpgradeBuildingResponse } from "./upgrade-building.dto"

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
                throw new PlacedItemNotFoundException(request.placedItemBuildingId)
            }

            const buildingInfo = placedItem.buildingInfo

            if (!buildingInfo) {
                throw new PlacedItemNotFoundException("Building information not found for placed item.")
            }

            const currentUpgradeLevel = buildingInfo.currentUpgrade

            const maxUpgradeLevel = Math.max(
                ...buildingInfo.building.upgrades.map((upgrade) => upgrade.upgradeLevel)
            )

            if (currentUpgradeLevel === maxUpgradeLevel) {
                throw new BuildingAlreadyMaxUpgradeException(request.placedItemBuildingId)
            }

            // Fetch the next upgrade level
            const nextUpgrade = buildingInfo.building.upgrades.find(
                (upgrade) => upgrade.upgradeLevel === currentUpgradeLevel + 1
            )

            if (!nextUpgrade) {
                throw new BuildingNextUpgradeNotFoundException(request.placedItemBuildingId)
            }

            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId },
            })

            if (!user) {
                throw new UserNotFoundException(request.userId)
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
                this.logger.error("Upgrade transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new UpgradeBuildingTransactionFailedException(error)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}

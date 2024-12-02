import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { PlacedItemEntity, UserEntity } from "@src/database"
import {
    PlacedItemNotFoundException,
    BuildingAlreadyMaxUpgradeException,
    UpgradeBuildingTransactionFailedException,
    BuildingNextUpgradeNotFoundException,
    UserNotFoundException,
} from "@src/exceptions"
import { GoldBalanceService } from "@src/services"
import { UpgradeBuildingRequest, UpgradeBuildingResponse } from "./upgrade-building.dto"

@Injectable()
export class UpgradeBuildingService {
    private readonly logger = new Logger(UpgradeBuildingService.name)

    constructor(
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async upgradeBuilding(request: UpgradeBuildingRequest): Promise<UpgradeBuildingResponse> {
        this.logger.debug(
            `Starting upgrade for placedItem ${request.placedItemId} by user ${request.userId}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Fetch placed item
            const placedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: request.placedItemId, userId: request.userId },
                relations: {
                    buildingInfo: {
                        building: {
                            upgrades: true,
                        }
                    }
                },
            })

            if (!placedItem) {
                throw new PlacedItemNotFoundException(request.placedItemId)
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
                throw new BuildingAlreadyMaxUpgradeException(request.placedItemId)
            }

            // Fetch the next upgrade level
            const nextUpgrade = buildingInfo.building.upgrades.find(
                (upgrade) => upgrade.upgradeLevel === currentUpgradeLevel + 1
            )

            if (!nextUpgrade) {
                throw new BuildingNextUpgradeNotFoundException(request.placedItemId)
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

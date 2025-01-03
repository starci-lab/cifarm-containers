import { Injectable, Logger } from "@nestjs/common"
import { BuildingEntity, GameplayPostgreSQLService, PlacedItemEntity, PlacedItemTypeEntity, UserEntity } from "@src/databases"
import {
    BuildingNotAvailableInShopException,
    BuildingNotFoundException,
    ConstructBuildingTransactionFailedException,
    PlacedItemTypeNotFoundException
} from "@src/exceptions"
import { DataSource, DeepPartial } from "typeorm"
import { ConstructBuildingRequest, ConstructBuildingResponse } from "./construct-building.dto"
import { GoldBalanceService } from "@src/gameplay"

@Injectable()
export class ConstructBuildingService {
    private readonly logger = new Logger(ConstructBuildingService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,        
        private readonly goldBalanceService: GoldBalanceService
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async constructBuilding(request: ConstructBuildingRequest): Promise<ConstructBuildingResponse> {
        this.logger.debug(
            `Starting building construction for user ${request.userId}, building id: ${request.buildingId}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Fetch building information
            const building = await queryRunner.manager.findOne(BuildingEntity, {
                where: { id: request.buildingId }
            })

            if (!building) {
                throw new BuildingNotFoundException(request.buildingId)
            }

            if (!building.availableInShop) {
                throw new BuildingNotAvailableInShopException(request.buildingId)
            }

            // Fetch placed item type
            const placedItemType = await queryRunner.manager.findOne(PlacedItemTypeEntity, {
                where: { id: request.buildingId }
            })

            if (!placedItemType) {
                throw new PlacedItemTypeNotFoundException(request.buildingId)
            }

            // Calculate total cost
            const totalCost = building.price

            const user: UserEntity = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            //Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            // Prepare placed item entity
            const placedItem: DeepPartial<PlacedItemEntity> = {
                userId: request.userId,
                buildingInfo: {
                    currentUpgrade: 1,
                    occupancy: 0,
                    buildingId: building.id
                },
                x: request.position.x,
                y: request.position.y,
                placedItemTypeId: placedItemType.id
            }

            // Subtract gold
            const goldsChanged = this.goldBalanceService.subtract({
                entity: user,
                amount: totalCost
            })

            // Start transaction
            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.update(UserEntity, user.id, {
                    ...goldsChanged
                })

                // Save the placed item in the database
                await queryRunner.manager.save(PlacedItemEntity, placedItem)

                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error("Construction transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new ConstructBuildingTransactionFailedException(error)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}

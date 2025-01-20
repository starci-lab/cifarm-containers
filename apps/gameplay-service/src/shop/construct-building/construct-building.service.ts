import { Injectable, Logger } from "@nestjs/common"
import { BuildingEntity, InjectPostgreSQL, PlacedItemEntity, PlacedItemTypeEntity, UserEntity } from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { DataSource, DeepPartial } from "typeorm"
import { ConstructBuildingRequest, ConstructBuildingResponse } from "./construct-building.dto"
import { GrpcNotFoundException, GrpcInternalException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class ConstructBuildingService {
    private readonly logger = new Logger(ConstructBuildingService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,      
        private readonly goldBalanceService: GoldBalanceService
    ) {
    }

    async constructBuilding(request: ConstructBuildingRequest): Promise<ConstructBuildingResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Fetch building information
            const building = await queryRunner.manager.findOne(BuildingEntity, {
                where: { id: request.buildingId }
            })

            if (!building) {
                throw new GrpcNotFoundException("Building not found")
            }

            if (!building.availableInShop) {
                throw new GrpcFailedPreconditionException("Building not available in shop")
            }

            // Fetch placed item type
            const placedItemType = await queryRunner.manager.findOne(PlacedItemTypeEntity, {
                where: { id: request.buildingId }
            })

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
                buildingInfo: {},
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

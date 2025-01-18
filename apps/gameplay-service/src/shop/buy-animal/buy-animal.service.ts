import { Injectable, Logger } from "@nestjs/common"
import {
    AnimalEntity,
    InjectPostgreSQL,
    PlacedItemEntity,
    PlacedItemType,
    PlacedItemTypeEntity,
    UserEntity
} from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { DataSource, DeepPartial } from "typeorm"
import { BuyAnimalRequest, BuyAnimalResponse } from "./buy-animal.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService
    ) {
    }

    async buyAnimal(request: BuyAnimalRequest): Promise<BuyAnimalResponse> {
        this.logger.debug(
            `Starting animal purchase for user ${request.userId}, animal id: ${request.animalId}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const animal = await queryRunner.manager.findOne(AnimalEntity, {
                where: { id: request.animalId }
            })

            if (!animal) {
                throw new GrpcNotFoundException("Animal not found")
            }

            if (!animal.availableInShop) {
                throw new GrpcFailedPreconditionException("Animal not available in shop")
            }

            const placedItemBuilding = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    id: request.placedItemBuildingId
                },
                relations: {
                    buildingInfo: {
                        building: {
                            upgrades: true
                        }
                    },
                    placedItemType: true
                }
            })

            if (!placedItemBuilding)
                throw new GrpcNotFoundException("Building not found")

            //Check if placedItem is building
            if (placedItemBuilding.placedItemType.type != PlacedItemType.Building)
                throw new GrpcFailedPreconditionException("Placed item is not a building")

            //Check if building is same animal type
            if (placedItemBuilding.buildingInfo.building.type != animal.type)
                throw new GrpcFailedPreconditionException("Building is not for this animal")

            //Find placedItemType
            const placedItemType = await queryRunner.manager.findOne(PlacedItemTypeEntity, {
                where: {
                    type: PlacedItemType.Animal,
                    animalId: request.animalId
                }
            })

            if (!placedItemType) throw new GrpcFailedPreconditionException("Animal type not found")

            const user: UserEntity = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            if (!user) throw new GrpcNotFoundException("User not found")

            const totalCost = animal.price

            //Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            const placedItemAnimal: DeepPartial<PlacedItemEntity> = {
                userId: request.userId,
                animalInfo: {
                    animalId: request.animalId
                },
                x: request.position.x,
                y: request.position.y,
                placedItemTypeId: placedItemType.id,
                parentId: placedItemBuilding.id
            }

            const maxCapacity =
                placedItemBuilding.buildingInfo.building.upgrades[
                    placedItemBuilding.buildingInfo.currentUpgrade
                ].capacity

            //Check occupancy
            if (placedItemBuilding.buildingInfo.occupancy >= maxCapacity)
                throw new GrpcFailedPreconditionException("Building is full")

            placedItemBuilding.buildingInfo.occupancy += 1

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

                await queryRunner.manager.save(PlacedItemEntity, [
                    placedItemAnimal,
                    placedItemBuilding
                ])

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

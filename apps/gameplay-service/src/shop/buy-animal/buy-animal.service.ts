import { Injectable, Logger } from "@nestjs/common"
import {
    AnimalEntity,
    PlacedItemEntity,
    PlacedItemType,
    PlacedItemTypeEntity,
    UserEntity
} from "@src/database"
import {
    AnimalNotAvailableInShopException,
    AnimalNotFoundException,
    BuildingCapacityExceededException,
    BuildingNotSameAnimalException,
    BuyAnimalTransactionFailedException,
    PlacedItemNotFoundException,
    PlacedItemTypeNotBuildingException,
    PlacedItemTypeNotFoundException,
    UserNotFoundException
} from "@src/exceptions"
import { GoldBalanceService } from "@src/services"
import { DataSource, DeepPartial } from "typeorm"
import { BuyAnimalRequest, BuyAnimalResponse } from "./buy-animal.dto"

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)
    constructor(
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

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
                throw new AnimalNotFoundException(request.animalId)
            }

            if (!animal.availableInShop) {
                throw new AnimalNotAvailableInShopException(request.animalId)
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
                throw new PlacedItemNotFoundException(request.placedItemBuildingId)

            //Check if placedItem is building
            if (placedItemBuilding.placedItemType.type != PlacedItemType.Building)
                throw new PlacedItemTypeNotBuildingException(request.placedItemBuildingId)

            //Check if building is same animal type
            if (placedItemBuilding.buildingInfo.building.type != animal.type)
                throw new BuildingNotSameAnimalException(request.animalId)

            //Find placedItemType
            const placedItemType = await queryRunner.manager.findOne(PlacedItemTypeEntity, {
                where: {
                    type: PlacedItemType.Animal,
                    animalId: request.animalId
                }
            })

            if (!placedItemType) throw new PlacedItemTypeNotFoundException(request.animalId)

            const user: UserEntity = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            if (!user) throw new UserNotFoundException(request.userId)

            const totalCost = animal.price

            //Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            // Start transaction
            await queryRunner.startTransaction()

            try {
                // Subtract gold
                const goldsChanged = this.goldBalanceService.subtract({
                    entity: user,
                    golds: totalCost
                })

                await queryRunner.manager.update(UserEntity, user.id, {
                    ...goldsChanged
                })

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
                    throw new BuildingCapacityExceededException(placedItemBuilding.id)

                placedItemBuilding.buildingInfo.occupancy += 1

                const [savedPlacedItemAnimal] = await queryRunner.manager.save(PlacedItemEntity, [
                    placedItemAnimal,
                    placedItemBuilding
                ])

                await queryRunner.commitTransaction()

                this.logger.log(`Successfully placed animal with id: ${savedPlacedItemAnimal.id}`)
                return { placedItemId: savedPlacedItemAnimal.id }
            } catch (error) {
                this.logger.error("Animal purchase transaction failed, rolling back...")
                await queryRunner.rollbackTransaction()
                throw new BuyAnimalTransactionFailedException(error)
            }
        } finally {
            await queryRunner.release()
        }
    }
}

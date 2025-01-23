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
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
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
                    buildingInfo: true,
                    placedItemType: {
                        building: {
                            upgrades: true
                        }
                    }
                }
            })

            if (!placedItemBuilding) throw new GrpcNotFoundException("Building not found")

            if (!placedItemBuilding.placedItemType)
                throw new GrpcNotFoundException("Placed item type not found")

            //Check if placedItem is building
            if (placedItemBuilding.placedItemType.type != PlacedItemType.Building)
                throw new GrpcFailedPreconditionException("Placed item is not a building")

            //Check if building is same animal type
            if (placedItemBuilding.placedItemType.building.type != animal.type)
                throw new GrpcFailedPreconditionException("Building is not for this animal")

            //Check if slot is occupied
            const maxCapacity =
                placedItemBuilding.placedItemType.building.upgrades[
                    placedItemBuilding.buildingInfo.currentUpgrade
                ].capacity

            //Check occupancy
            const count = await queryRunner.manager.count(PlacedItemEntity, {
                where: {
                    parentId: placedItemBuilding.id
                }
            })
            if (count >= maxCapacity)
                throw new GrpcFailedPreconditionException("Building is full")

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
                animalInfo: {},
                x: request.position.x,
                y: request.position.y,
                placedItemTypeId: placedItemType.id,
                parentId: placedItemBuilding.id
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

            // Publish event
            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: user.id
            })
            
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}

import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { AnimalEntity, BuildingEntity, PlacedItemEntity, UserEntity } from "@src/database"
import {
    AnimalNotAvailableInShopException,
    AnimalNotFoundException,
    AnimalTypeMismatchException,
    BuildingCapacityExceededException,
    BuyAnimalTransactionFailedException,
    ParentBuildingNotFoundException
} from "@src/exceptions"
import { GoldBalanceService } from "@src/services"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { BuyAnimalRequest, BuyAnimalResponse } from "./buy-animal.dto"

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async buyAnimal(request: BuyAnimalRequest): Promise<BuyAnimalResponse> {
        this.logger.debug(
            `Starting animal purchase for user ${request.userId}, animal id: ${request.id}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        const animal = await queryRunner.manager.findOne(AnimalEntity, {
            where: { id: request.id }
        })

        if (!animal) {
            throw new AnimalNotFoundException(request.id)
        }

        if (!animal.availableInShop) {
            throw new AnimalNotAvailableInShopException(request.id)
        }

        const building = await queryRunner.manager.findOne(BuildingEntity, {
            where: { id: request.buildingId }
        })

        if (!building) {
            throw new ParentBuildingNotFoundException(request.buildingId)
        }

        if (building.type != animal.type) {
            throw new AnimalTypeMismatchException(building.type, animal.type)
        }

        //get placedItems of the building
        const placedItems = await queryRunner.manager.find(PlacedItemEntity, {
            where: {
                buildingInfo: {
                    building: {
                        type: building.type
                    }
                }
            },
            relations: {
                buildingInfo: true
            }
        })
        // Check if building is full: does not have any placeItems building
        if (placedItems.length > 0) {
            throw new BuildingCapacityExceededException("Building is full.")
        }

        // Check building capacity
        // const maxCapacity =

        // if (building. >= maxCapacity) {
        //     throw new BuildingCapacityExceededException("Building is full.")
        // }

        // Start transaction
        await queryRunner.startTransaction()

        try {
            // Deduct animal cost from the user's balance
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            if (!user) {
                throw new Error("User not found.")
            }

            // this.goldBalanceService.checkSufficient({
            //     current: user.golds,
            //     required: animal.price,
            // })

            // const updatedGolds = this.goldBalanceService.subtract({
            //     entity: user,
            //     golds: animal.price,
            // })

            // await queryRunner.manager.save(UserEntity, {
            //     id: request.userId,
            //     ...updatedGolds,
            // })

            // Place animal in the building
            // const placedAnimal: DeepPartial<PlacedItemEntity> = {
            //     userId: request.userId,
            //     parentPlacedItemId: request.buildingId,
            //     type: "Animal",
            //     animalInfo: { animal },
            //     position: request.position,
            // }

            // const savedAnimal = await queryRunner.manager.save(PlacedItemEntity, placedAnimal)

            // // Update building occupancy
            // building.buildingInfo.occupancy += 1
            await queryRunner.manager.save(building)

            await queryRunner.commitTransaction()

            // this.logger.log(`Successfully placed animal with id: ${savedAnimal.id}`)
            return { placedItemId: "" }
        } catch (error) {
            this.logger.error("Animal purchase transaction failed, rolling back...", error)
            await queryRunner.rollbackTransaction()
            throw new BuyAnimalTransactionFailedException(error.message)
        } finally {
            await queryRunner.release()
        }
    }
}

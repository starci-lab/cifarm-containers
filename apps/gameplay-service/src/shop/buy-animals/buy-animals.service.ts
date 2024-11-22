import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { AnimalEntity, BuildingEntity, PlacedItemEntity } from "@src/database"
import {
    AnimalNotAvailableInShopException,
    AnimalNotFoundException
} from "@src/exceptions/static/animal.exception"
import { Cache } from "cache-manager"
import { GrpcAbortedException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { DataSource } from "typeorm"
import { BuyAnimalRequest, BuyAnimalResponse } from "./buy-animals.dto"

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)
    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) {}

    async buyAnimal(request: BuyAnimalRequest): Promise<BuyAnimalResponse> {
        // Fetch animal details
        const animal = await this.dataSource.manager.findOne(AnimalEntity, {
            where: { id: request.id }
        })

        if (!animal) throw new AnimalNotFoundException(request.id)
        if (!animal.availableInShop) throw new AnimalNotAvailableInShopException(request.id)

        // Fetch parent building details
        const building = await this.dataSource.manager.findOne(PlacedItemEntity, {
            where: { buildingInfo: { id: request.buildingId }, userId: request.userId }
        })

        if (!building) throw new GrpcNotFoundException("Parent building not found")
        if (building.type !== "Building")
            throw new GrpcAbortedException("Parent item is not a building")

        // Validate building and animal type compatibility
        if (building.buildingInfo.building.type !== animal.type) {
            throw new GrpcAbortedException("Animal type does not match building type")
        }

        // Check building capacity
        const maxCapacity =
            building.buildingInfo.building.upgrades[building.buildingInfo.currentUpgrade].capacity
        if (building.buildingInfo.occupancy >= maxCapacity) {
            throw new GrpcAbortedException("Building is full")
        }

        // Deduct animal cost from wallet
        await this.walletService.subtractGold(userId, animal.price, {
            name: "Buy animal",
            key
        })

        // Place animal in the building
        const placedAnimal = this.dataSource.manager.create(PlacedItemEntity, {
            userId,
            referenceKey: key,
            parentPlacedItemKey: BuildingId,
            type: "Animal",
            position,
            animalInfo: { animal }
        })

        const savedAnimal = await this.dataSource.manager.save(placedAnimal)

        // Update building occupancy
        building.buildingInfo.occupancy += 1
        await this.dataSource.manager.save(building)

        this.logger.debug(`Animal placed with key: ${savedAnimal.id}`)

        return { placedItemAnimalId: savedAnimal.id }
    }
}

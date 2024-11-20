import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { IWalletService } from "@src/containers/wallet-service"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { BuyAnimalsRequest, BuyAnimalsResponse } from "./buy-animals.dto"
import { AnimalEntity, PlacedItemEntity } from "@src/database"
import {
    GrpcAbortedException,
    GrpcNotFoundException,
    GrpcPermissionDeniedException
} from "nestjs-grpc-exceptions"

@Injectable()
export class BuyAnimalsService {
    private readonly logger = new Logger(BuyAnimalsService.name)
    private walletService: IWalletService
    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        @Inject(walletGrpcConstants.NAME) private client: ClientGrpc
    ) {}

    onModuleInit() {
        this.walletService = this.client.getService<IWalletService>(walletGrpcConstants.SERVICE)
    }

    async buyAnimals(request: BuyAnimalsRequest): Promise<BuyAnimalsResponse> {
        const { userId, key, buildingKey, position } = request

        // Fetch animal details
        const animal = await this.dataSource.manager.findOne(AnimalEntity, {
            where: { id: key }
        })

        if (!animal) throw new GrpcNotFoundException("Animal not found")
        if (!animal.availableInShop)
            throw new GrpcPermissionDeniedException("Animal not available in shop")

        // Fetch parent building details
        const building = await this.dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: buildingKey, userId }
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
            parentPlacedItemKey: buildingKey,
            type: "Animal",
            position,
            animalInfo: { animal }
        })

        const savedAnimal = await this.dataSource.manager.save(placedAnimal)

        // Update building occupancy
        building.buildingInfo.occupancy += 1
        await this.dataSource.manager.save(building)

        this.logger.debug(`Animal placed with key: ${savedAnimal.id}`)

        return { placedItemAnimalKey: savedAnimal.id }
    }
}

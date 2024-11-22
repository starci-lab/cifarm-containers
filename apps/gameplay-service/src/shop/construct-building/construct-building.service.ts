import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { BuildingEntity, PlacedItemEntity, PlacedItemType, UserEntity } from "@src/database"
import { Cache } from "cache-manager"
import {
    GrpcAbortedException,
    GrpcNotFoundException,
    GrpcPermissionDeniedException
} from "nestjs-grpc-exceptions"
import { lastValueFrom } from "rxjs"
import { DataSource, DeepPartial } from "typeorm"
import { ConstructBuildingRequest, ConstructBuildingResponse } from "./construct-building.dto"

@Injectable()
export class ConstructBuildingService {
    private readonly logger = new Logger(ConstructBuildingService.name)
    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async constructBuilding(request: ConstructBuildingRequest): Promise<ConstructBuildingResponse> {
        // Fetch building details
        const buildings = await this.cacheManager.get<Array<BuildingEntity>>(REDIS_KEY.BUILDINGS)
        const building = buildings.find((c) => c.id.toString() === key.toString())
        if (!building) throw new GrpcNotFoundException("Building not found or invalid key: " + key)
        if (!building.availableInShop)
            throw new GrpcPermissionDeniedException("Building not available in shop")

        const user = await this.dataSource.manager.findOne(UserEntity, { where: { id: userId } })
        if (!user) {
            throw new GrpcNotFoundException("User not found: " + userId)
        }

        const totalCost = building.price
        this.logger.debug(`Total cost: ${totalCost}`)
        const balance = await lastValueFrom(this.walletService.getGoldBalance({ userId }))
        if (balance.golds < totalCost) {
            throw new GrpcAbortedException("Insufficient gold balance")
        }

        await lastValueFrom(this.walletService.subtractGold({ userId, golds: totalCost }))

        const placedItem: DeepPartial<PlacedItemEntity> = {
            userId: userId,
            user: user,
            itemKey: key,
            type: PlacedItemType.Building,
            x: position.x,
            y: position.y,
            buildingInfo: {
                currentUpgrade: 1,
                occupancy: 0,
                building
            }
        }

        // Create a placed building item
        const placedBuilding = this.dataSource.manager.create(PlacedItemEntity, placedItem)
        const savedBuilding = await this.dataSource.manager.save(placedBuilding)

        this.logger.debug(`Building constructed with key: ${savedBuilding.id}`)

        return { placedItemId: savedBuilding.id }
    }
}

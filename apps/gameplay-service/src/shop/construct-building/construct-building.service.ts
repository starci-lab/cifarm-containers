import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { BuildingEntity, PlacedItemEntity, PlacedItemTypeEntity } from "@src/database"
import {
    BuildingNotAvailableInShopException,
    BuildingNotFoundException,
    PlacedItemTypeNotFoundException,
    UserInsufficientGoldException
} from "@src/exceptions"
import { GoldBalanceService } from "@src/services"
import { Cache } from "cache-manager"
import { DataSource, DeepPartial } from "typeorm"
import { ConstructBuildingRequest, ConstructBuildingResponse } from "./construct-building.dto"

@Injectable()
export class ConstructBuildingService {
    private readonly logger = new Logger(ConstructBuildingService.name)
    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private readonly walletService: GoldBalanceService
    ) {}

    async constructBuilding(request: ConstructBuildingRequest): Promise<ConstructBuildingResponse> {
        this.logger.debug("hehe")
        const building = await this.dataSource.manager.findOne(BuildingEntity, {
            where: { id: request.id }
        })

        if (!building) {
            throw new BuildingNotFoundException(request.id)
        }
        if (!building.availableInShop) {
            throw new BuildingNotAvailableInShopException(request.id)
        }

        const placedItemType = await this.dataSource.manager.findOne(PlacedItemTypeEntity, {
            where: { id: request.id }
        })

        if (!placedItemType) {
            throw new PlacedItemTypeNotFoundException(request.id)
        }

        const totalCost = building.price || 0

        const balance = await this.walletService.getGoldBalance({ userId: request.userId })

        if (balance.golds < totalCost) {
            throw new UserInsufficientGoldException(balance.golds, totalCost)
        }

        await this.walletService.subtractGold({ userId: request.userId, golds: totalCost })

        this.logger.debug("start")

        // Prepare placed item entity
        const placedItem: DeepPartial<PlacedItemEntity> = {
            user: { id: request.userId },
            buildingInfo: {
                currentUpgrade: 1,
                occupancy: 0,
                building
            },
            x: request.position.x,
            y: request.position.y,
            placedItemType: {
                id: placedItemType.id
            }
        }

        this.logger.debug("end")

        const savedBuilding = await this.dataSource.manager.save(PlacedItemEntity, placedItem)

        this.logger.log(`Successfully constructed building: ${savedBuilding.id}`)

        return { placedItemId: savedBuilding.id }
    }
}

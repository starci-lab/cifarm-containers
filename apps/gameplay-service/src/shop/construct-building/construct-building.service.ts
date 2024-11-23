import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { IWalletService } from "@src/containers/wallet-service"
import { BuildingEntity, PlacedItemEntity } from "@src/database"
import {
    BuildingNotAvailableInShopException,
    BuildingNotFoundException,
    PlacedItemTypeNotFoundException,
    UserInsufficientGoldException
} from "@src/exceptions"
import { Cache } from "cache-manager"
import { lastValueFrom } from "rxjs"
import { DataSource, DeepPartial } from "typeorm"
import { ConstructBuildingRequest, ConstructBuildingResponse } from "./construct-building.dto"

@Injectable()
export class ConstructBuildingService {
    private readonly logger = new Logger(ConstructBuildingService.name)
    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private readonly walletService: IWalletService
    ) {}

    async constructBuilding(request: ConstructBuildingRequest): Promise<ConstructBuildingResponse> {
        const building = await this.dataSource.manager.findOne(BuildingEntity, {
            where: { id: request.id }
        })

        if (!building) {
            throw new BuildingNotFoundException(request.id)
        }
        if (!building.availableInShop) {
            throw new BuildingNotAvailableInShopException(request.id)
        }

        const placedItemType = await this.dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: request.id }
        })

        if (!placedItemType) {
            throw new PlacedItemTypeNotFoundException(request.id)
        }

        const totalCost = building.price || 0

        const balance = await lastValueFrom(
            this.walletService.getGoldBalance({ userId: request.userId })
        )

        if (balance.golds < totalCost) {
            throw new UserInsufficientGoldException(balance.golds, totalCost)
        }

        await lastValueFrom(
            this.walletService.subtractGold({ userId: request.id, golds: totalCost })
        )

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

        const savedBuilding = await this.dataSource.manager.save(PlacedItemEntity, placedItem)

        this.logger.log(`Successfully constructed building: ${savedBuilding.id}`)

        return { placedItemId: savedBuilding.id }
    }
}

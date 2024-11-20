import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { REDIS_KEY } from "@src/constants"
import { IWalletService } from "@src/containers/wallet-service"
import { BuildingEntity, CropEntity, InventoryType } from "@src/database"
import { Cache } from "cache-manager"
import {
    GrpcAbortedException,
    GrpcNotFoundException,
    GrpcPermissionDeniedException
} from "nestjs-grpc-exceptions"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"
import { InventoryService } from "../inventory"
import { ConstructBuildingRequest, ConstructBuildingResponse } from "./construct-building.dto"

@Injectable()
export class ConstructBuildingService {
    private readonly logger = new Logger(ConstructBuildingService.name)
    private walletService: IWalletService

    constructor(
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService,
        @Inject(walletGrpcConstants.NAME) private client: ClientGrpc,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    onModuleInit() {
        this.walletService = this.client.getService<IWalletService>(walletGrpcConstants.SERVICE)
    }

    async constructBuilding(request: ConstructBuildingRequest): Promise<ConstructBuildingResponse> {
        const { userId, key, position } = request

        // Fetch building details
        const building = await this.dataSource.manager.findOne(BuildingEntity, {
            where: { id: key }
        })
        if (!building) throw new GrpcNotFoundException("Building not found")

        // Deduct the building cost from the user's wallet
        await this.walletService.subtractGold(userId, building.price, {
            name: "Construct building"
        })

        // Create a placed building item
        const placedBuilding = this.dataSource.manager.create(PlacedItemEntity, {
            userId,
            referenceKey: key,
            position,
            type: "Building",
            buildingInfo: {
                building,
                currentUpgrade: 1,
                occupancy: 0
            }
        })
        const savedBuilding = await this.dataSource.manager.save(placedBuilding)

        this.logger.debug(`Building constructed with key: ${savedBuilding.id}`)

        return { placedItemBuildingKey: savedBuilding.id }
    }
}

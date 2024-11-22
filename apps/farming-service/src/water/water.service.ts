import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { Activities, AnimalEntity, PlacedItemEntity, SystemEntity, SystemId } from "@src/database"
import {
    GrpcAbortedException,
    GrpcNotFoundException,
    GrpcPermissionDeniedException
} from "nestjs-grpc-exceptions"
import { userGrpcConstants, IUserService } from "@apps/user-service"
import { IInventoryService, inventoryGrpcConstants } from "@apps/inventory-service"
import { IPlacedItemService, placedItemGrpcConstants } from "@apps/placed-item-service"
import { IStaticService, staticGrpcConstants } from "@apps/static-service"
import { WaterRequest, WaterResponse } from "./water.dto"

@Injectable()
export class WaterService {
    private readonly logger = new Logger(WaterService.name)

    private userService: IUserService
    private inventoryService: IInventoryService
    private placedItemService: IPlacedItemService
    private staticService: IStaticService

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        @Inject(userGrpcConstants.NAME) private client: ClientGrpc
    ) {}

    onModuleInit() {
        this.userService = this.client.getService<IUserService>(userGrpcConstants.SERVICE)
        this.inventoryService = this.client.getService<IInventoryService>(
            inventoryGrpcConstants.SERVICE
        )
        this.placedItemService = this.client.getService<IPlacedItemService>(
            placedItemGrpcConstants.SERVICE
        )
        this.staticService = this.client.getService<IStaticService>(staticGrpcConstants.SERVICE)
    }

    async water(request: WaterRequest): Promise<WaterResponse> {
        //get experience and energy
        const { value : activities } = await this.dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const { water: { energyCost, experiencesGain } } = activities as Activities

        
    }
}

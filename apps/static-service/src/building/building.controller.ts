import { staticGrpcConstants } from "@apps/static-service/src/constants"
import { Controller, Logger, UseInterceptors } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import {
    CreateBuildingRequest,
    CreateBuildingResponse,
    DeleteBuildingRequest,
    DeleteBuildingResponse,
    GetBuildingRequest,
    GetBuildingResponse,
    GetBuildingsResponse,
    UpdateBuildingRequest,
    UpdateBuildingResponse
} from "./building.dto"
import { BuildingService } from "./building.service"
import { CacheInterceptor, CacheKey } from "@nestjs/cache-manager"
import { EntityCacheKey } from "@src/constants"
import { IdCacheInterceptor } from "@src/interceptors/id-cache.interceptor"

@Controller()
export class BuildingController {
    private readonly logger = new Logger(BuildingController.name)

    constructor(private readonly BuildingService: BuildingService) {}

    @UseInterceptors(CacheInterceptor)
    @CacheKey(EntityCacheKey.Buildings)
    @GrpcMethod(staticGrpcConstants.SERVICE, "GetBuildings")
    async getBuildings(): Promise<GetBuildingsResponse> {
        return this.BuildingService.getBuildings()
    }

    @UseInterceptors(IdCacheInterceptor)
    @CacheKey(EntityCacheKey.Buildings)
    @GrpcMethod(staticGrpcConstants.SERVICE, "GetBuilding")
    async getBuilding(request: GetBuildingRequest): Promise<GetBuildingResponse> {
        return this.BuildingService.getBuilding(request)
    }

    // Create a new Building
    @GrpcMethod(staticGrpcConstants.SERVICE, "CreateBuilding")
    async createBuilding(request: CreateBuildingRequest): Promise<CreateBuildingResponse> {
        this.logger.debug(`Creating Building: ${JSON.stringify(request)}`)
        return this.BuildingService.createBuilding(request)
    }

    // Update an existing Building
    @GrpcMethod(staticGrpcConstants.SERVICE, "UpdateBuilding")
    async updateBuilding(request: UpdateBuildingRequest): Promise<UpdateBuildingResponse> {
        this.logger.debug(`Updating Building: ${JSON.stringify(request)}`)
        return this.BuildingService.updateBuilding(request)
    }

    // Delete a Building by ID
    @GrpcMethod(staticGrpcConstants.SERVICE, "DeleteBuilding")
    async deleteBuilding(request: DeleteBuildingRequest): Promise<DeleteBuildingResponse> {
        this.logger.debug(`Deleting Building: ${JSON.stringify(request)}`)
        return this.BuildingService.deleteBuilding(request)
    }
}

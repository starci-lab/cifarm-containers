import { staticGrpcConstants } from "@apps/static-service/src/constants"
import { CACHE_MANAGER, CacheInterceptor, CacheKey } from "@nestjs/cache-manager"
import { Controller, Inject, Logger, UseInterceptors } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { EntityCacheKey } from "@src/constants"
import { IdCacheInterceptor } from "@src/interceptors"
import {
    CreateCropRequest,
    CreateCropResponse,
    DeleteCropRequest,
    DeleteCropResponse,
    GetCropRequest,
    GetCropResponse,
    GetCropsResponse,
    UpdateCropRequest,
    UpdateCropResponse
} from "./crop.dto"
import { CropService } from "./crop.service"

@Controller()
export class CropController {
    private readonly logger = new Logger(CropController.name)

    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly cropService: CropService
    ) {}

    @UseInterceptors(CacheInterceptor)
    @CacheKey(EntityCacheKey.Crops)
    @GrpcMethod(staticGrpcConstants.SERVICE, "GetCrops")
    async getCrops(): Promise<GetCropsResponse> {
        return this.cropService.getCrops()
    }

    @UseInterceptors(IdCacheInterceptor)
    @CacheKey(EntityCacheKey.Crops)
    @GrpcMethod(staticGrpcConstants.SERVICE, "GetCrop")
    async getCrop(request: GetCropRequest): Promise<GetCropResponse> {
        return this.cropService.getCrop(request)
    }

    // Create a new crop
    @GrpcMethod(staticGrpcConstants.SERVICE, "CreateCrop")
    async createCrop(request: CreateCropRequest): Promise<CreateCropResponse> {
        this.logger.debug(`Creating crop: ${JSON.stringify(request)}`)
        return this.cropService.createCrop(request)
    }

    // Update an existing crop
    @GrpcMethod(staticGrpcConstants.SERVICE, "UpdateCrop")
    async updateCrop(request: UpdateCropRequest): Promise<UpdateCropResponse> {
        this.logger.debug(`Updating crop: ${JSON.stringify(request)}`)
        return this.cropService.updateCrop(request)
    }

    // Delete a crop by ID
    @GrpcMethod(staticGrpcConstants.SERVICE, "DeleteCrop")
    async deleteCrop(request: DeleteCropRequest): Promise<DeleteCropResponse> {
        this.logger.debug(`Deleting crop: ${JSON.stringify(request)}`)
        return this.cropService.deleteCrop(request)
    }
}

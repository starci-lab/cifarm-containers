import { EntityCacheKey, staticGrpcConstants } from "@apps/static-service"
import { Controller, Logger, UseInterceptors } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import {
    GetSystemRequest,
    GetSystemResponse
} from "./system.dto"
import { SystemService } from "./system.service"
import { CacheInterceptor, CacheKey } from "@nestjs/cache-manager"

@Controller()
export class SystemController {
    private readonly logger = new Logger(SystemController.name)

    constructor(private readonly systemService: SystemService) {}

    @UseInterceptors(CacheInterceptor)
    @CacheKey(EntityCacheKey.System)
    @GrpcMethod(staticGrpcConstants.SERVICE, "GetSystem")
    async getSystem(request: GetSystemRequest): Promise<GetSystemResponse> {
        return this.systemService.getSystem(request)
    }
}

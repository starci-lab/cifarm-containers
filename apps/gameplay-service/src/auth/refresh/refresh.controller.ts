import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { RefreshService } from "./refresh.service"
import { grpcConfig, GrpcServiceName } from "@src/config"
import { RefreshRequest } from "./refresh.dto"
  
@Controller()
export class RefreshController {
    private readonly logger = new Logger(RefreshController.name)

    constructor(private readonly refreshService: RefreshService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "Refresh")
    public async Refresh(request: RefreshRequest) {
        return this.refreshService.refresh(request)
    }
}

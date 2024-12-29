import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { RefreshService } from "./refresh.service"
import { grpcData, GrpcServiceName } from "@src/grpc"
import { RefreshRequest } from "./refresh.dto"
  
@Controller()
export class RefreshController {
    private readonly logger = new Logger(RefreshController.name)

    constructor(private readonly refreshService: RefreshService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "Refresh")
    public async Refresh(request: RefreshRequest) {
        return this.refreshService.refresh(request)
    }
}

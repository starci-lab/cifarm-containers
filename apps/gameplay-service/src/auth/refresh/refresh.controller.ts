import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { RefreshService } from "./refresh.service"
import { getGrpcData, GrpcName } from "@src/grpc"
import { RefreshRequest } from "./refresh.dto"
  
@Controller()
export class RefreshController {
    private readonly logger = new Logger(RefreshController.name)

    constructor(private readonly refreshService: RefreshService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "Refresh")
    public async Refresh(request: RefreshRequest) {
        return this.refreshService.refresh(request)
    }
}

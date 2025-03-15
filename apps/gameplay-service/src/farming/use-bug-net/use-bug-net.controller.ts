import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { UseBugNetService } from "./use-bug-net.service"
import { UseBugNetRequest } from "./use-bug-net.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class UseBugNetController {
    private readonly logger = new Logger(UseBugNetController.name)

    constructor(private readonly useBugNetService: UseBugNetService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "UseBugNet")
    public async useBugNet(request: UseBugNetRequest) {
        this.logger.debug("Use bug net request called")
        return this.useBugNetService.useBugNet(request)
    }
}

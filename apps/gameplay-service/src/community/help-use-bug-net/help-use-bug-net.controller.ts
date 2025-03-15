import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HelpUseBugNetService } from "./help-use-bug-net.service"
import { HelpUseBugNetRequest } from "./help-use-bug-net.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class HelpUseBugNetController {
    private readonly logger = new Logger(HelpUseBugNetService.name)

    constructor(private readonly helpUseBugNetService: HelpUseBugNetService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "HelpUseBugNet")
    public async helpUseBugNet(request: HelpUseBugNetRequest) {
        this.logger.debug("HelpUseBugNet called")
        return this.helpUseBugNetService.helpUseBugNet(request)
    }
}

import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HelpWaterService } from "./help-water.service"
import { HelpWaterRequest } from "./help-water.dto"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class HelpWaterController {
    private readonly logger = new Logger(HelpWaterController.name)

    constructor(private readonly helpWaterService: HelpWaterService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "HelpWater")
    public async helpWater(request: HelpWaterRequest) {
        this.logger.debug("HelpWater called")
        return this.helpWaterService.helpWater(request)
    }
}

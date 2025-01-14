import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HelpUsePesticideService } from "./help-use-pesticide.service"
import { HelpUsePesticideRequest } from "./help-use-pesticide.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class HelpUsePesticideController {
    private readonly logger = new Logger(HelpUsePesticideController.name)

    constructor(private readonly helpUsePesticideService: HelpUsePesticideService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "HelpUsePesticide")
    public async helpUsePesticide(request: HelpUsePesticideRequest) {
        this.logger.debug("HelpUsePesticide request called")
        return this.helpUsePesticideService.helpUsePesticide(request)
    }
}

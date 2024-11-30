import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HelpUsePesticideService } from "./help-use-pesticide.service"
import { HelpUsePesticideRequest } from "./help-use-pesticide.dto"
import { grpcConfig } from "@src/config"

@Controller()
export class HelpUsePesticideController {
    private readonly logger = new Logger(HelpUsePesticideController.name)

    constructor(private readonly helpUsePesticideService: HelpUsePesticideService) {}

    @GrpcMethod(grpcConfig.gameplay.service, "HelpUsePesticide")
    public async helpUsePesticide(request: HelpUsePesticideRequest) {
        this.logger.debug("HelpUsePesticide request called")
        return this.helpUsePesticideService.helpUsePesticide(request)
    }
}

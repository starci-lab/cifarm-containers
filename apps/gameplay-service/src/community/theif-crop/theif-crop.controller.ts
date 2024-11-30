import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HelpUseHerbicideService } from "./theif-crop.service"
import { HelpUseHerbicideRequest } from "./theif-crop.dto"
import { grpcConfig } from "@src/config"

@Controller()
export class HelpUseHerbicideController {
    private readonly logger = new Logger(HelpUseHerbicideController.name)

    constructor(private readonly helpUseHerbicideService: HelpUseHerbicideService) {}

    @GrpcMethod(grpcConfig.gameplay.service, "HelpUseHerbicide")
    public async helpUseHerbicide(request: HelpUseHerbicideRequest) {
        this.logger.debug("HelpUseHerbicide request called")
        return this.helpUseHerbicideService.helpUseHerbicide(request)
    }
}

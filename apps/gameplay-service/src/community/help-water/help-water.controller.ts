import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../app.constants"
import { HelpWaterService } from "./help-water.service"
import { HelpWaterRequest } from "./help-water.dto"

@Controller()
export class HelpWaterController {
    private readonly logger = new Logger(HelpWaterController.name)

    constructor(private readonly helpWaterService: HelpWaterService) {}

    @GrpcMethod(gameplayGrpcConstants.SERVICE, "HelpWater")
    public async helpWater(request: HelpWaterRequest) {
        this.logger.debug("HelpWater called")
        return this.helpWaterService.helpWater(request)
    }
}

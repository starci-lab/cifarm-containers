import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../app.constants"
import { UsePesticideRequest } from "./use-pesticide.dto"
import { UsePesticideService } from "./use-pesticide.service"

@Controller()
export class UsePesticideController {
    private readonly logger = new Logger(UsePesticideController.name)

    constructor(private readonly usePesticideService: UsePesticideService) {}

    @GrpcMethod(gameplayGrpcConstants.SERVICE, "UsePesticide")
    public async usePesticide(request: UsePesticideRequest) {
        this.logger.debug("Use pesticide request called")
        return this.usePesticideService.usePesticide(request)
    }
}
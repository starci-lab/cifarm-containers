import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { UseHerbicideService } from "./use-herbicide.service"
import { gameplayGrpcConstants } from "../../app.constants"
import { UseHerbicideRequest } from "./use-herbicide.dto"

@Controller()
export class UseHerbicideController {
    private readonly logger = new Logger(UseHerbicideController.name)

    constructor(private readonly useHerbicideService: UseHerbicideService) {}

    @GrpcMethod(gameplayGrpcConstants.SERVICE, "UseHerbicide")
    public async useHerbicide(request: UseHerbicideRequest) {
        this.logger.debug("Use herbicide request called")
        return this.useHerbicideService.useHerbicide(request)
    }
}

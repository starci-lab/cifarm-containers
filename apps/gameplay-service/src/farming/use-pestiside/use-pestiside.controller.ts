import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { UsePestisideService } from "./use-pestiside.service"
import { gameplayGrpcConstants } from "../../app.constants"
import { UsePestisideRequest } from "./use-pestiside.dto"

@Controller()
export class UsePestisideController {
    private readonly logger = new Logger(UsePestisideController.name)

    constructor(private readonly usePestisideService: UsePestisideService) {}

    @GrpcMethod(gameplayGrpcConstants.SERVICE, "UsePestiside")
    public async usePestiside(request: UsePestisideRequest) {
        this.logger.debug("Use pestiside request called")
        return this.usePestisideService.usePestiside(request)
    }
}

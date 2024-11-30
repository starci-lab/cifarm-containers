import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../config"
import { UseFertilizerRequest } from "./use-fertilizer.dto"
import { UseFertilizerService } from "./use-fertilizer.service"

@Controller()
export class UseFertilizerController {
    private readonly logger = new Logger(UseFertilizerController.name)

    constructor(private readonly useFertilizerService: UseFertilizerService) {}

    @GrpcMethod(gameplayGrpcConstants.service, "UseFertilizer")
    public async useFertilizer(request: UseFertilizerRequest) {
        this.logger.debug("Use Fertilizer request called")
        return this.useFertilizerService.useFertilizer(request)
    }
}

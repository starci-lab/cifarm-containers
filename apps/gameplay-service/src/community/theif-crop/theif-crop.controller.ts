import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { TheifCropService } from "./theif-crop.service"
import { grpcConfig } from "@src/config"
import { TheifCropRequest } from "./theif-crop.dto"

@Controller()
export class TheifCropController {
    private readonly logger = new Logger(TheifCropController.name)

    constructor(private readonly theifCropService : TheifCropService) {}

    @GrpcMethod(grpcConfig.gameplay.service, "TheifCrop")
    public async theifCrop(request: TheifCropRequest) {
        this.logger.debug("TheifCrop request called")
        return this.helpUseHerbicideService.helpUseHerbicide(request)
    }
}

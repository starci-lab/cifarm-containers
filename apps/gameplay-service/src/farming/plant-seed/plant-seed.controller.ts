import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HarvestCropService } from "./plant-seed.service"
import { gameplayGrpcConstants } from "../../app.constants"
import { HarvestCropRequest } from "./plant-seed.dto"

@Controller()
export class HarvestCropController {
    private readonly logger = new Logger(HarvestCropController.name)

    constructor(private readonly harvestCropService: HarvestCropService) {}

    @GrpcMethod(gameplayGrpcConstants.SERVICE, "HarvestCrop")
    public async water(request: HarvestCropRequest) {
        this.logger.debug("Harvest crop request called")
        return this.harvestCropService.harvestCrop(request)
    }
}

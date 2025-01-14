import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HarvestCropService } from "./harvest-crop.service"
import { HarvestCropRequest } from "./harvest-crop.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class HarvestCropController {
    private readonly logger = new Logger(HarvestCropController.name)

    constructor(private readonly harvestCropService: HarvestCropService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "HarvestCrop")
    public async harvestCrop(request: HarvestCropRequest) {
        this.logger.debug("Harvest crop request called")
        return this.harvestCropService.harvestCrop(request)
    }
}

import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { TheifCropService } from "./thief-crop.service"
import { getGrpcData, GrpcName } from "@src/grpc"
import { ThiefCropRequest } from "./thief-crop.dto"

@Controller()
export class ThiefCropController {
    private readonly logger = new Logger(ThiefCropController.name)

    constructor(private readonly thiefCropService : TheifCropService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "ThiefCrop")
    public async thiefCrop(request: ThiefCropRequest) {
        this.logger.debug("ThiefCrop request called")
        return this.thiefCropService.theifCrop(request)
    }
}

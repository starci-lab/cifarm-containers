import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { ThiefCropService } from "./thief-crop.service"
import { getGrpcData, GrpcName } from "@src/grpc"
import { ThiefCropRequest } from "./thief-crop.dto"

@Controller()
export class ThiefCropController {
    private readonly logger = new Logger(ThiefCropController.name)

    constructor(private readonly thiefCropService : ThiefCropService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "ThiefCrop")
    public async thiefCrop(request: ThiefCropRequest) {
        this.logger.debug("ThiefCrop request called")
        return this.thiefCropService.thiefCrop(request)
    }
}

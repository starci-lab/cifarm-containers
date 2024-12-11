import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { ThiefCropService } from "./thief-crop.service"
import { grpcConfig, GrpcServiceName } from "@src/config"
import { ThiefCropRequest } from "./thief-crop.dto"

@Controller()
export class ThiefCropController {
    private readonly logger = new Logger(ThiefCropController.name)

    constructor(private readonly thiefCropService : ThiefCropService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "ThiefCrop")
    public async thiefCrop(request: ThiefCropRequest) {
        this.logger.debug("ThiefCrop request called")
        return this.thiefCropService.thiefCrop(request)
    }
}

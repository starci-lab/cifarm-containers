import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { TheifCropService } from "./thief-crop.service"
import { grpcData, GrpcServiceName } from "@src/grpc"
import { ThiefCropRequest } from "./thief-crop.dto"

@Controller()
export class ThiefCropController {
    private readonly logger = new Logger(ThiefCropController.name)

    constructor(private readonly thiefCropService : TheifCropService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "ThiefCrop")
    public async thiefCrop(request: ThiefCropRequest) {
        this.logger.debug("ThiefCrop request called")
        return this.thiefCropService.theifCrop(request)
    }
}

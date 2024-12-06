import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { TheifCropService } from "./theif-crop.service"
import { grpcConfig, GrpcServiceName } from "@src/config"
import { TheifCropRequest } from "./theif-crop.dto"

@Controller()
export class TheifCropController {
    private readonly logger = new Logger(TheifCropController.name)

    constructor(private readonly theifCropService : TheifCropService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "TheifCrop")
    public async theifCrop(request: TheifCropRequest) {
        this.logger.debug("TheifCrop request called")
        return this.theifCropService.theifCrop(request)
    }
}

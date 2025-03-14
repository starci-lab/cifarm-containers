import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { WaterCropService } from "./water-crop.service"
import { WaterCropRequest } from "./water-crop.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class WaterCropController {
    private readonly logger = new Logger(WaterCropController.name)

    constructor(private readonly waterService: WaterCropService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "WaterCrop")
    public async water(request: WaterCropRequest) {
        return this.waterService.water(request)
    }
}

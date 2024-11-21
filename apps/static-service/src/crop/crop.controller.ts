import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { staticGrpcConstants } from "@apps/static-service/src/constants"
import { CropService } from "./crop.service"
import { GetCropsResponse } from "./crop.dto"

@Controller()
export class CropController {
    private readonly logger = new Logger(CropController.name)

    constructor(private readonly cropService: CropService) {}

    @GrpcMethod(staticGrpcConstants.SERVICE, "GetCrops")
    async getCrops(): Promise<GetCropsResponse> {
        return this.cropService.getCrops()
    }
}

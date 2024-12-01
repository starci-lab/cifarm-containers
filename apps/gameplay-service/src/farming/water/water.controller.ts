import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { WaterService } from "./water.service"
import { WaterRequest } from "./water.dto"
import { grpcConfig } from "@src/config"

@Controller()
export class WaterController {
    private readonly logger = new Logger(WaterController.name)

    constructor(private readonly waterService: WaterService) {}

    @GrpcMethod(grpcConfig.gameplay.service, "Water")
    public async water(request: WaterRequest) {
        this.logger.debug("Water request called")
        return this.waterService.water(request)
    }
}

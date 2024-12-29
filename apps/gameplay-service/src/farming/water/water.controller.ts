import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { WaterService } from "./water.service"
import { WaterRequest } from "./water.dto"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class WaterController {
    private readonly logger = new Logger(WaterController.name)

    constructor(private readonly waterService: WaterService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "Water")
    public async water(request: WaterRequest) {
        this.logger.debug("Water request called")
        return this.waterService.water(request)
    }
}

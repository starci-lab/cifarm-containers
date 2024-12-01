import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { SpeedUpService } from "./speed-up.service"
import { SpeedUpRequest } from "./speed-up.dto"
import { grpcConfig, GrpcServiceName } from "@src/config"

@Controller()
export class SpeedUpController {
    private readonly logger = new Logger(SpeedUpController.name)

    constructor(private readonly speedUpService: SpeedUpService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "SpeedUp")
    public async speedUp(request: SpeedUpRequest) {
        this.logger.debug(`Speeding up growth time with time ${request.time}`)
        return this.speedUpService.speedUp(request)
    }
}

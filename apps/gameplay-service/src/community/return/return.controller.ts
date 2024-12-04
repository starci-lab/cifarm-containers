import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { grpcConfig, GrpcServiceName } from "@src/config"
import { ReturnService } from "./return.service"
import { ReturnRequest } from "./return.dto"

@Controller()
export class ReturnController {
    private readonly logger = new Logger(ReturnController.name)

    constructor(private readonly returnService: ReturnService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "Return")
    async return(request: ReturnRequest) {
        this.logger.debug("Return called")
        await this.returnService.return(request)
    }
}

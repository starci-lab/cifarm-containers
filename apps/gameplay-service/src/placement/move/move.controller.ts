import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { grpcConfig, GrpcServiceName } from "@src/config"
import { MoveRequest } from "./move.dto"
import { MoveService } from "./move.service"


@Controller()
export class MoveController {
    private readonly logger = new Logger(MoveController.name)

    constructor(private readonly moveService: MoveService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "Move")
    public async move(request: MoveRequest) {
        this.logger.debug("Move called")
        return this.moveService.move(request)
    }
}

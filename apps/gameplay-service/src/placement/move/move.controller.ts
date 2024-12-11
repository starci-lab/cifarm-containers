import { Body, Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { grpcConfig, GrpcServiceName } from "@src/config"
import { MoveService } from "./move.service"
import { MoveRequest } from "./move.dto"

@Controller()
export class MoveController {
    private readonly logger = new Logger(MoveController.name)
    constructor(
            private readonly placementService: MoveService
    ){}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "Move") 
    public async move(@Body() request: MoveRequest) {
        this.logger.debug(`Received request to move placement: ${JSON.stringify(request)}`)
        return await this.placementService.move(request)
    }
    
}

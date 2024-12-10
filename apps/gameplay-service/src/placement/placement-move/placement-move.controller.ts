import { Body, Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { grpcConfig, GrpcServiceName } from "@src/config"
import PlacementMoveRequest from "./placement-move.dto"
import { PlacementMoveService } from "./placement-move.service"

@Controller()
export class PlacementMoveController {
    private readonly logger = new Logger(PlacementMoveController.name)
    constructor(
            private readonly placementService: PlacementMoveService
    ){}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "move") 
    public async move(@Body() request: PlacementMoveRequest) {
        this.logger.debug(`Received request to move placement: ${JSON.stringify(request)}`)
        return await this.placementService.move(request)
    }
    
}

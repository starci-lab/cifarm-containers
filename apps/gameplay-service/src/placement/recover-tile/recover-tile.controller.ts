import { Body, Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { grpcConfig, GrpcServiceName } from "@src/config"
import RecoverTileRequest from "./recover-tile.dto"
import { RecoverTileService } from "./recover-tile.service"

@Controller()
export class RecoverTileController {
    private readonly logger = new Logger(RecoverTileController.name)
    constructor(
            private readonly placementService: RecoverTileService
    ){}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "move") 
    public async move(@Body() request: RecoverTileRequest) {
        this.logger.debug(`Received request to recover Tile: ${JSON.stringify(request)}`)
        return await this.placementService.recoverTile(request)
    }
    
}

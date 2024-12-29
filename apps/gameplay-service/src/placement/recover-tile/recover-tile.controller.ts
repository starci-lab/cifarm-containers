import { Body, Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { grpcData, GrpcServiceName } from "@src/grpc"
import { RecoverTileService } from "./recover-tile.service"
import { RecoverTileRequest } from "./recover-tile.dto"

@Controller()
export class RecoverTileController {
    private readonly logger = new Logger(RecoverTileController.name)
    constructor(
            private readonly placementService: RecoverTileService
    ){}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "RecoverTile") 
    public async recoverTile(@Body() request: RecoverTileRequest) {
        this.logger.debug(`Received request to recover Tile: ${JSON.stringify(request)}`)
        return await this.placementService.recoverTile(request)
    }
    
}

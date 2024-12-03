import { Body, Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { grpcConfig, GrpcServiceName } from "@src/config"
import { PlaceTileRequest } from "../../farming/place-tile"
import { PlaceTitleService } from "./place-tile.service"

@Controller()
export class PlaceTitleController {
    private readonly logger = new Logger(PlaceTitleController.name)
    constructor(
            private readonly placementService: PlaceTitleService
    ){}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "place_tile") 
    public async placeTile(@Body() request: PlaceTileRequest) {
        this.logger.debug(`Received request to place tile: ${JSON.stringify(request)}`)
        return await this.placementService.placeTile(request)
    }
    
}

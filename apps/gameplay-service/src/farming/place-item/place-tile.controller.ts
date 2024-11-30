import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../config"
import { PlaceTileRequest, PlaceTileResponse } from "./place-tile.dto"
import { PlaceTileService } from "./place-tile.service"

@Controller()
export class PlaceTileController {
    private readonly logger = new Logger(PlaceTileController.name)

    constructor(private readonly placeTileService: PlaceTileService) {}

    @GrpcMethod(gameplayGrpcConstants.service, "PlaceTile")
    public async placeTile(request: PlaceTileRequest): Promise<PlaceTileResponse> {
        this.logger.debug("Place Tile request received")
        return this.placeTileService.placeTile(request)
    }
}

import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { PlaceTileRequest, PlaceTileResponse } from "./place-tile.dto"
import { PlaceTileService } from "./place-tile.service"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class PlaceTileController {
    private readonly logger = new Logger(PlaceTileController.name)

    constructor(private readonly placeTileService: PlaceTileService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "PlaceTile")
    public async placeTile(request: PlaceTileRequest): Promise<PlaceTileResponse> {
        this.logger.debug("Place Tile request received")
        return this.placeTileService.placeTile(request)
    }
}

import { Body, Controller, Logger } from "@nestjs/common"
import { ConstructBuildingService } from "./construct-building.service"
import { GrpcMethod } from "@nestjs/microservices"
import { ConstructBuildingRequest, ConstructBuildingResponse } from "./construct-building.dto"
import { grpcConfig } from "@src/config"

@Controller()
export class ConstructBuildingController {
    private readonly logger = new Logger(ConstructBuildingController.name)

    constructor(private readonly constructBuildingService: ConstructBuildingService) {}

    @GrpcMethod(grpcConfig.gameplay.service, "ConstructBuilding")
    public async constructBuilding(
        @Body() request: ConstructBuildingRequest
    ): Promise<ConstructBuildingResponse> {
        this.logger.debug(`Received request to construct building: ${JSON.stringify(request)}`)
        return await this.constructBuildingService.constructBuilding(request)
    }
}

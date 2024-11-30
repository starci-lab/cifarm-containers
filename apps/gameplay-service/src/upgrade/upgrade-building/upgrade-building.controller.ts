import { Body, Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../config"
import { UpgradeBuildingRequest, UpgradeBuildingResponse } from "./upgrade-building.dto"
import { UpgradeBuildingService } from "./upgrade-building.service"

@Controller()
export class UpgradeBuildingController {
    private readonly logger = new Logger(UpgradeBuildingController.name)

    constructor(private readonly UpgradeBuildingService: UpgradeBuildingService) {}

    @GrpcMethod(gameplayGrpcConstants.service, "UpgradeBuilding")
    public async upgradeBuilding(
        @Body() request: UpgradeBuildingRequest
    ): Promise<UpgradeBuildingResponse> {
        this.logger.debug(`Received request to upgrade building: ${JSON.stringify(request)}`)
        return await this.UpgradeBuildingService.upgradeBuilding(request)
    }
}

import { Module } from "@nestjs/common"
import { UpgradeBuildingGateway } from "./upgrade-building.gateway"
import { UpgradeBuildingService } from "./upgrade-building.service"

@Module({
    providers: [UpgradeBuildingService, UpgradeBuildingGateway],
})
export class UpgradeBuildingModule {}

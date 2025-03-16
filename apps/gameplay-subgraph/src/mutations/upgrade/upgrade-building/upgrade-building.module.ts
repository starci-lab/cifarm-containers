import { Module } from "@nestjs/common"
import { UpgradeBuildingResolver } from "./upgrade-building.resolver"
import { UpgradeBuildingService } from "./upgrade-building.service"

@Module({
    providers: [UpgradeBuildingService, UpgradeBuildingResolver],
})
export class UpgradeBuildingModule {}

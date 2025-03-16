import { Module } from "@nestjs/common"
import { UpgradeBuildingController } from "./upgrade-building.resolver"
import { UpgradeBuildingService } from "./upgrade-building.service"

@Module({
    controllers: [UpgradeBuildingController],
    providers: [UpgradeBuildingService],
})
export class UpgradeBuildingModule {}

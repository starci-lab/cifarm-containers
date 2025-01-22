import { Module } from "@nestjs/common"
import { UpgradeBuildingController } from "./upgrade-building.controller"
import { UpgradeBuildingService } from "./upgrade-building.service"

@Module({
    controllers: [UpgradeBuildingController],
    providers: [UpgradeBuildingService],
})
export class UpgradeBuildingModule {}

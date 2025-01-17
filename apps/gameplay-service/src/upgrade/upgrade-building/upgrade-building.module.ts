import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { UpgradeBuildingController } from "./upgrade-building.controller"
import { UpgradeBuildingService } from "./upgrade-building.service"

@Module({
    imports: [
        GameplayModule
    ],
    controllers: [UpgradeBuildingController],
    providers: [UpgradeBuildingService],
    exports: [UpgradeBuildingService]
})
export class UpgradeBuildingModule {}

import { Global, Module } from "@nestjs/common"
import { GameplayPostgreSQLModule } from "@src/databases"
import { GameplayModule } from "@src/gameplay"
import { UpgradeBuildingController } from "./upgrade-building.controller"
import { UpgradeBuildingService } from "./upgrade-building.service"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forFeature(),
        GameplayModule
    ],
    controllers: [UpgradeBuildingController],
    providers: [UpgradeBuildingService],
    exports: [UpgradeBuildingService]
})
export class UpgradeBuildingModule {}

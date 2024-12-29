import { Global, Module } from "@nestjs/common"
import { UpgradeBuildingController } from "./upgrade-building.controller"
import { UpgradeBuildingService } from "./upgrade-building.service"
import { GameplayPostgreSQLModule } from "@src/databases"
import { GoldBalanceModule } from "@src/gameplay"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GoldBalanceModule
    ],
    controllers: [UpgradeBuildingController],
    providers: [UpgradeBuildingService],
    exports: [UpgradeBuildingService]
})
export class UpgradeBuildingModule {}

import { Global, Module } from "@nestjs/common"
import { GoldBalanceModule } from "@src/services"
import { UpgradeBuildingController } from "./upgrade-building.controller"
import { UpgradeBuildingService } from "./upgrade-building.service"
import { GameplayPostgreSQLModule } from "@src/databases"

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

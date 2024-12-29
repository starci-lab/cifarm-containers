import { Global, Module } from "@nestjs/common"
import { ConstructBuildingController } from "./construct-building.controller"
import { ConstructBuildingService } from "./construct-building.service"
import { GameplayPostgreSQLModule } from "@src/databases"
import { GoldBalanceModule, TokenBalanceModule } from "@src/gameplay"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GoldBalanceModule,
        TokenBalanceModule
    ],
    controllers: [ConstructBuildingController],
    providers: [ConstructBuildingService],
    exports: [ConstructBuildingService]
})
export class ConstructBuildingModule {}
 
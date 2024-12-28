import { Global, Module } from "@nestjs/common"
import { WalletModule } from "@src/services/gameplay/wallet"
import { ConstructBuildingController } from "./construct-building.controller"
import { ConstructBuildingService } from "./construct-building.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        WalletModule
    ],
    controllers: [ConstructBuildingController],
    providers: [ConstructBuildingService],
    exports: [ConstructBuildingService]
})
export class ConstructBuildingModule {}
 
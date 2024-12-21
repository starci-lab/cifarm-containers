import { Global, Module } from "@nestjs/common"
import { WalletModule } from "@src/services/gameplay/wallet"
import { UpgradeBuildingController } from "./upgrade-building.controller"
import { UpgradeBuildingService } from "./upgrade-building.service"
import { typeOrmForFeature } from "@src/dynamic-modules"
@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        WalletModule
    ],
    controllers: [UpgradeBuildingController],
    providers: [UpgradeBuildingService],
    exports: [UpgradeBuildingService]
})
export class UpgradeBuildingModule {}

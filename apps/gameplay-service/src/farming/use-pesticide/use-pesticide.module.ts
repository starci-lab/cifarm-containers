import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { UsePesticideController } from "./use-pesticide.controller"
import { UsePesticideService } from "./use-pesticide.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [UsePesticideController],
    providers: [UsePesticideService],
    exports: [UsePesticideService]
})
export class UsePesticideModule {}

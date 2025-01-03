import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { EnergyModule } from "@src/gameplay/energy/energy.module"
import { UsePesticideController } from "./use-pesticide.controller"
import { UsePesticideService } from "./use-pesticide.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        GameplayModule
    ],
    controllers: [UsePesticideController],
    providers: [UsePesticideService],
    exports: [UsePesticideService]
})
export class UsePesticideModule {}

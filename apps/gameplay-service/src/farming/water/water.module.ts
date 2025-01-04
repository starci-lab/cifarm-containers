import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { WaterService } from "./water.service"
import { WaterController } from "./water.controller"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GameplayModule
    ],
    providers: [WaterService],
    exports: [WaterService],
    controllers: [WaterController],
})
export class WaterModule {}

import { Global, Module } from "@nestjs/common"
import { SpeedUpController } from "./speed-up.controller"
import { SpeedUpService } from "./speed-up.service"
import { GameplayPostgreSQLModule } from "@src/databases"


@Global()
@Module({
    imports: [GameplayPostgreSQLModule.forFeature()],
    providers: [SpeedUpService],
    exports: [SpeedUpService],
    controllers: [SpeedUpController]
})
export class SpeedUpModule {}

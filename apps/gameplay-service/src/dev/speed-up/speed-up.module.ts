import { Global, Module } from "@nestjs/common"
import { SpeedUpController } from "./speed-up.controller"
import { SpeedUpService } from "./speed-up.service"

@Global()
@Module({
    imports: [],
    providers: [SpeedUpService],
    exports: [SpeedUpService],
    controllers: [SpeedUpController]
})
export class SpeedUpModule {}

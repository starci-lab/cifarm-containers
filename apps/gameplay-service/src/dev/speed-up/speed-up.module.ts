import { Module } from "@nestjs/common"
import { SpeedUpController } from "./speed-up.controller"
import { SpeedUpService } from "./speed-up.service"

@Module({
    providers: [SpeedUpService],
    exports: [SpeedUpService],
    controllers: [SpeedUpController]
})
export class SpeedUpModule {}

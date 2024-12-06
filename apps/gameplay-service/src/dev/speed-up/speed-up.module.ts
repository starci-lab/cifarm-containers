import { Global, Module } from "@nestjs/common"
import { SpeedUpController } from "./speed-up.controller"
import { SpeedUpService } from "./speed-up.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [typeOrmForFeature()],
    providers: [SpeedUpService],
    exports: [SpeedUpService],
    controllers: [SpeedUpController]
})
export class SpeedUpModule {}

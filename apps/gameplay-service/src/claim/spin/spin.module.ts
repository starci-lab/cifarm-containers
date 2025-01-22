import { Module } from "@nestjs/common"
import { SpinController } from "./spin.controller"
import { SpinService } from "./spin.service"

@Module({
    providers: [SpinService],
    controllers: [SpinController]
})
export class SpinModule {}

import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { SpinController } from "./spin.controller"
import { SpinService } from "./spin.service"

@Module({
    imports: [GameplayModule],
    providers: [SpinService],
    exports: [SpinService],
    controllers: [SpinController]
})
export class SpinModule {}

import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { BuySeedsController } from "./buy-seeds.controller"
import { BuySeedsService } from "./buy-seeds.service"

@Module({
    imports: [
        GameplayModule
    ],
    providers: [BuySeedsService],
    exports: [BuySeedsService],
    controllers: [BuySeedsController]
})
export class BuySeedsModule {}

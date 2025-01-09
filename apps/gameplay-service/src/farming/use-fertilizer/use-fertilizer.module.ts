import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { UseFertilizerController } from "./use-fertilizer.controller"
import { UseFertilizerService } from "./use-fertilizer.service"

@Module({
    imports: [GameplayModule],
    controllers: [UseFertilizerController],
    providers: [UseFertilizerService],
    exports: [UseFertilizerService]
})
export class UseFertilizerModule {}

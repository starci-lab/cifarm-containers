import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { UseHerbicideController } from "./use-herbicide.controller"
import { UseHerbicideService } from "./use-herbicide.service"

@Module({
    imports: [GameplayModule],
    controllers: [UseHerbicideController],
    providers: [UseHerbicideService],
    exports: [UseHerbicideService]
})
export class UseHerbicideModule {}

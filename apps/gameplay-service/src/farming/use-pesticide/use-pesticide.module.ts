import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { UsePesticideController } from "./use-pesticide.controller"
import { UsePesticideService } from "./use-pesticide.service"

@Module({
    imports: [GameplayModule],
    controllers: [UsePesticideController],
    providers: [UsePesticideService],
    exports: [UsePesticideService]
})
export class UsePesticideModule {}

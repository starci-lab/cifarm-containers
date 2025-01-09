import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { BuyAnimalController } from "./buy-animal.controller"
import { BuyAnimalService } from "./buy-animal.service"

@Module({
    imports: [
        GameplayModule
    ],
    controllers: [BuyAnimalController],
    providers: [BuyAnimalService],
    exports: [BuyAnimalService]
})
export class BuyAnimalModule {}

import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { CureAnimalController } from "./cure-animal.controller"
import { CureAnimalService } from "./cure-animal.service"

@Global()
@Module({
    imports: [GameplayModule],
    controllers: [CureAnimalController],
    providers: [CureAnimalService],
    exports: [CureAnimalService]
})
export class CureAnimalModule {}

import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { ThiefAnimalProductController } from "./thief-animal-product.controller"
import { ThiefAnimalProductService } from "./thief-animal-product.service"

 
@Module({
    imports: [GameplayModule],
    providers: [ThiefAnimalProductService],
    exports: [ThiefAnimalProductService],
    controllers: [ThiefAnimalProductController]
})
export class ThiefAnimalProductModule {}

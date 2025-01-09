import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { CollectAnimalProductController } from "./collect-animal-product.controller"
import { CollectAnimalProductService } from "./collect-animal-product.service"

 
@Module({
    imports: [GameplayModule],
    controllers: [CollectAnimalProductController],
    providers: [CollectAnimalProductService],
    exports: [CollectAnimalProductService]
})
export class CollectAnimalProductModule {}

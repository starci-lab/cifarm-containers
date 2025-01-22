import { Module } from "@nestjs/common"
import { CollectAnimalProductController } from "./collect-animal-product.controller"
import { CollectAnimalProductService } from "./collect-animal-product.service"

 
@Module({
    controllers: [CollectAnimalProductController],
    providers: [CollectAnimalProductService]
})
export class CollectAnimalProductModule {}

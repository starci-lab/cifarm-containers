import { Module } from "@nestjs/common"
import { ThiefAnimalProductResolver } from "./thief-animal-product.resolver"
import { ThiefAnimalProductService } from "./thief-animal-product.service"

 
@Module({
    providers: [ThiefAnimalProductService, ThiefAnimalProductResolver]
})
export class ThiefAnimalProductModule {}

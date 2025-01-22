import { Module } from "@nestjs/common"
import { CureAnimalController } from "./cure-animal.controller"
import { CureAnimalService } from "./cure-animal.service"

 
@Module({
    controllers: [CureAnimalController],
    providers: [CureAnimalService]
})
export class CureAnimalModule {}

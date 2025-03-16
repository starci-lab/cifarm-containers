import { Module } from "@nestjs/common"
import { CureAnimalResolver } from "./cure-animal.resolver"
import { CureAnimalService } from "./cure-animal.service"

 
@Module({
    providers: [CureAnimalService, CureAnimalResolver]
})
export class CureAnimalModule {}

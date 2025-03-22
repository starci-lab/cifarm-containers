import { Module } from "@nestjs/common"
import { ThiefAnimalResolver } from "./thief-animal.resolver"
import { ThiefAnimalService } from "./thief-animal.service"

 
@Module({
    providers: [ThiefAnimalService, ThiefAnimalResolver]
})
export class ThiefAnimalModule {}

import { Module } from "@nestjs/common"
import { HarvestAnimalResolver } from "./harvest-animal.resolver"
import { HarvestAnimalService } from "./harvest-animal.service"

 
@Module({
    providers: [HarvestAnimalService, HarvestAnimalResolver]
})
export class HarvestAnimalModule {}

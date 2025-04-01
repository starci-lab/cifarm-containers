import { Module } from "@nestjs/common"
import { HarvestAnimalGateway } from "./harvest-animal.gateway"
import { HarvestAnimalService } from "./harvest-animal.service"

@Module({
    providers: [HarvestAnimalGateway, HarvestAnimalService],
    exports: [HarvestAnimalService],
})
export class HarvestAnimalModule {} 
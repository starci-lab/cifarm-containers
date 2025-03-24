import { Module } from "@nestjs/common"
import { HarvestAnimalService } from "./harvest-animal.service"
import { HarvestAnimalGateway } from "./harvest-animal.gateway"

@Module({
    providers: [
        HarvestAnimalGateway,
        HarvestAnimalService
    ],
})
export class HarvestAnimalModule {} 
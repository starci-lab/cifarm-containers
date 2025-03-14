import { Module } from "@nestjs/common"
import { HarvestAnimalController } from "./harvest-animal.controller"
import { HarvestAnimalService } from "./harvest-animal.service"

 
@Module({
    controllers: [HarvestAnimalController],
    providers: [HarvestAnimalService]
})
export class HarvestAnimalModule {}

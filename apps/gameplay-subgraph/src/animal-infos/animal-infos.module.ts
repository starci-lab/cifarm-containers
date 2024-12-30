import { Module } from "@nestjs/common"
 
import { AnimalInfosResolver } from "./animal-infos.resolver"
import { AnimalInfosService } from "./animal-infos.service"

@Module({
    imports: [ ],
    providers: [AnimalInfosService, AnimalInfosResolver]
})
export class AnimalInfosModule {}

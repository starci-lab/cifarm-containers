import { Module } from "@nestjs/common"
import { AnimalInfosService } from "./animal-infos.service"
import { AnimalInfosResolver } from "./animal-infos.resolver"

@Module({
    providers: [AnimalInfosService, AnimalInfosResolver]
})
export class AnimalInfosModule {}

import { Module } from "@nestjs/common"
import { typeOrmForFeature } from "@src/dynamic-modules"
import { AnimalInfosResolver } from "./animal-infos.resolver"
import { AnimalInfosService } from "./animal-infos.service"

@Module({
    imports: [typeOrmForFeature()],
    providers: [AnimalInfosService, AnimalInfosResolver]
})
export class AnimalInfosModule {}

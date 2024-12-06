import { AnimalInfosResolver } from "@apps/static-subgraph/src/animal-infos/animal-infos.resolver"
import { AnimalInfosService } from "@apps/static-subgraph/src/animal-infos/animal-infos.service"
import { Module } from "@nestjs/common"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [AnimalInfosService, AnimalInfosResolver]
})
export class AnimalInfosModule {}

import { AnimalInfosResolver } from "@apps/gameplay-subgraph/src/animal-infos/animal-infos.resolver"
import { AnimalInfosService } from "@apps/gameplay-subgraph/src/animal-infos/animal-infos.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [AnimalInfosService, AnimalInfosResolver]
})
export class AnimalInfosModule {}

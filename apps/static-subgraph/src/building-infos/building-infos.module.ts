import { BuildingInfosResolver } from "@apps/static-subgraph/src/building-infos/building-infos.resolver"
import { BuildingInfosService } from "@apps/static-subgraph/src/building-infos/building-infos.service"
import { Module } from "@nestjs/common"
import { typeOrmForFeature } from "@src/dynamic-modules"
@Module({
    imports: [typeOrmForFeature()],
    providers: [BuildingInfosService, BuildingInfosResolver]
})
export class BuildingInfosModule {}

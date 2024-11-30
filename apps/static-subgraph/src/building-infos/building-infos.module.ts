import { BuildingInfosResolver } from "@apps/static-subgraph/src/building-infos/building-infos.resolver"
import { BuildingInfosService } from "@apps/static-subgraph/src/building-infos/building-infos.service"
import { Module } from "@nestjs/common"
@Module({
    providers: [BuildingInfosService, BuildingInfosResolver]
})
export class BuildingInfosModule {}

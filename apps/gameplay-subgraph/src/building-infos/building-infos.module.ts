import { BuildingInfosResolver } from "@apps/gameplay-subgraph/src/building-infos/building-infos.resolver"
import { BuildingInfosService } from "@apps/gameplay-subgraph/src/building-infos/building-infos.service"
import { Module } from "@nestjs/common"
@Module({
    providers: [BuildingInfosService, BuildingInfosResolver]
})
export class BuildingInfosModule { }

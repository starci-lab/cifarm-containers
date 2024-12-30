import { Module } from "@nestjs/common"
import { BuildingInfosResolver } from "./building-infos.resolver"
import { BuildingInfosService } from "./building-infos.service"
 
@Module({
    imports: [ ],
    providers: [BuildingInfosService, BuildingInfosResolver]
})
export class BuildingInfosModule { }

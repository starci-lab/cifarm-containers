import { Module } from "@nestjs/common"
import { BuildingInfosResolver } from "./building-infos.resolver"
import { BuildingInfosService } from "./building-infos.service"
import { typeOrmForFeature } from "@src/dynamic-modules"
@Module({
    imports: [typeOrmForFeature()],
    providers: [BuildingInfosService, BuildingInfosResolver]
})
export class BuildingInfosModule { }

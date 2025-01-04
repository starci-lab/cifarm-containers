import { Module } from "@nestjs/common"
import { BuildingInfosResolver } from "./building-infos.resolver"
import { BuildingInfosService } from "./building-infos.service"
import { GameplayPostgreSQLModule } from "@src/databases"
 
@Module({
    imports: [  GameplayPostgreSQLModule.forRoot() ],
    providers: [BuildingInfosService, BuildingInfosResolver]
})
export class BuildingInfosModule { }

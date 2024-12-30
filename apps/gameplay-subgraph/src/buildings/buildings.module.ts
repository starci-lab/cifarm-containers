import { Module } from "@nestjs/common"
import { BuildingsResolver } from "./buildings.resolver"
import { BuildingsService } from "./buildings.service"
 

@Module({
    imports: [ ],
    providers: [BuildingsService, BuildingsResolver]
})
export class BuildingsModule {}

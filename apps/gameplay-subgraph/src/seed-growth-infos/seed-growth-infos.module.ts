import { Module } from "@nestjs/common"
import { SeedGrowthInfosResolver } from "./seed-growth-infos.resolver"
import { SeedGrowthInfosService } from "./seed-growth-infos.service"
 

@Module({
    imports: [ ],
    providers: [SeedGrowthInfosService, SeedGrowthInfosResolver]
})
export class SeedGrowthInfosModule {}

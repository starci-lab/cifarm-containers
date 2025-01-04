import { Module } from "@nestjs/common"
import { SeedGrowthInfosResolver } from "./seed-growth-infos.resolver"
import { SeedGrowthInfosService } from "./seed-growth-infos.service"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ GameplayPostgreSQLModule.forRoot() ],
    providers: [SeedGrowthInfosService, SeedGrowthInfosResolver]
})
export class SeedGrowthInfosModule {}

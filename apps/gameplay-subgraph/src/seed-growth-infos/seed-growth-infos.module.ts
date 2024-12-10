import { Module } from "@nestjs/common"
import { SeedGrowthInfosResolver } from "./seed-growth-infos.resolver"
import { SeedGrowthInfosService } from "./seed-growth-infos.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [SeedGrowthInfosService, SeedGrowthInfosResolver]
})
export class SeedGrowthInfosModule {}

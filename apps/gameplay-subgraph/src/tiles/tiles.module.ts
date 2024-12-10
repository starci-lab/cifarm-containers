import { Module } from "@nestjs/common"
import { TilesResolver } from "./tiles.resolver"
import { TilesService } from "./tiles.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [TilesService, TilesResolver]
})
export class TilesModule {}

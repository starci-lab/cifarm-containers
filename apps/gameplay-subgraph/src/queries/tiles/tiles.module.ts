import { Module } from "@nestjs/common"
import { TilesResolver } from "./tiles.resolver"
import { TilesService } from "./tiles.service"

@Module({
    providers: [ TilesService, TilesResolver ]
})
export class TilesModule {}

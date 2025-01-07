import { Module } from "@nestjs/common"
import { TilesResolver } from "./tiles.resolver"
import { TilesService } from "./tiles.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [ GameplayPostgreSQLModule.forFeature() ],
    providers: [ TilesService, TilesResolver ]
})
export class TilesModule {}

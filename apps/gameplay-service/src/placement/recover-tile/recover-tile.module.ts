import { Module } from "@nestjs/common"
import { RecoverTileService } from "./recover-tile.service"
import { RecoverTileController } from "./recover-tile.controller"
import { GameplayPostgreSQLModule } from "@src/databases"
import { GameplayModule } from "@src/gameplay"

@Module({
    imports: [
        GameplayPostgreSQLModule.forFeature(),
        GameplayModule
    ],
    controllers: [RecoverTileController],
    exports: [RecoverTileService],
    providers: [RecoverTileService],
})
export class RecoverTileModule {}
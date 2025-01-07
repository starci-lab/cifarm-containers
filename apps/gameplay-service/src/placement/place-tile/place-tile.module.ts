import { Global, Module } from "@nestjs/common"
import { PlaceTileController } from "./place-tile.controller"
import { PlaceTileService } from "./place-tile.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forFeature(),
    ],
    controllers: [PlaceTileController],
    providers: [PlaceTileService],
    exports: [PlaceTileService]
})
export class PlaceTileModule {}

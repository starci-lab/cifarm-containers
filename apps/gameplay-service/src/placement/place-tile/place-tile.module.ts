import { Global, Module } from "@nestjs/common"
import { typeOrmForFeature } from "@src/dynamic-modules"
import { PlaceTileController } from "./place-tile.controller"
import { PlaceTileService } from "./place-tile.service"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
    ],
    controllers: [PlaceTileController],
    providers: [PlaceTileService],
    exports: [PlaceTileService]
})
export class PlaceTileModule {}

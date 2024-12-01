import { Global, Module } from "@nestjs/common"
import { PlaceTileController } from "./place-tile.controller"
import { PlaceTileService } from "./place-tile.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

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

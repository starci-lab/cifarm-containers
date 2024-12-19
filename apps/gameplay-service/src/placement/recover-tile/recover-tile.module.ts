import { Module } from "@nestjs/common"
import { typeOrmForFeature } from "@src/dynamic-modules"
import { RecoverTileService } from "./recover-tile.service"
import { RecoverTileController } from "./recover-tile.controller"

@Module({
    imports: [
        typeOrmForFeature(),
    ],
    controllers: [RecoverTileController],
    exports: [RecoverTileService],
    providers: [RecoverTileService],
})
export class RecoverTileModule {}
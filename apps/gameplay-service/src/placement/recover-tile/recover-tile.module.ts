import { Module } from "@nestjs/common"
import { RecoverTileController, RecoverTileService } from "."
import { typeOrmForFeature } from "@src/dynamic-modules"
import { InventoryService } from "@src/services"

@Module({
    imports: [
        typeOrmForFeature(),
        InventoryService
    ],
    controllers: [RecoverTileController],
    exports: [RecoverTileService],
    providers: [RecoverTileService],
})
export class RecoverTileModule {}
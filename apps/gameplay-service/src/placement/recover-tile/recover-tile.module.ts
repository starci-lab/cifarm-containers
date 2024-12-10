import { Module } from "@nestjs/common"
import { RecoverTileController, RecoverTileService } from "."

@Module({
    providers: [RecoverTileService],
    controllers: [RecoverTileController]
})
export class RecoverTileModule {}
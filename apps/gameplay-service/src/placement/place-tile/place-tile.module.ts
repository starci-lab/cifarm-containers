import { Module } from "@nestjs/common"
import { PlaceTitleController } from "./place-tile.controller"
import { PlaceTitleService } from "./place-tile.service"

@Module({
    providers: [PlaceTitleService],
    controllers: [PlaceTitleController]
})
export class PlaceTitleModule {}

import { Module } from "@nestjs/common"
import { UseHerbicideController } from "./use-herbicide.controller"
import { UseHerbicideService } from "./use-herbicide.service"

@Module({
    controllers: [UseHerbicideController],
    providers: [UseHerbicideService]
})
export class UseHerbicideModule {}

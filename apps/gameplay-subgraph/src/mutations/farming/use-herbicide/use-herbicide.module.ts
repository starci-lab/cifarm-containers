import { Module } from "@nestjs/common"
import { UseHerbicideResolver } from "./use-herbicide.resolver"
import { UseHerbicideService } from "./use-herbicide.service"

@Module({
    providers: [UseHerbicideService, UseHerbicideResolver]
})
export class UseHerbicideModule {}

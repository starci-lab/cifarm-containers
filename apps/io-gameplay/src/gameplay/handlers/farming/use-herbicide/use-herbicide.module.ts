import { Module } from "@nestjs/common"
import { UseHerbicideService } from "./use-herbicide.service"
import { UseHerbicideGateway } from "./use-herbicide.gateway"

@Module({
    providers: [UseHerbicideService, UseHerbicideGateway],
})
export class UseHerbicideModule {} 
import { Module } from "@nestjs/common"
import { UseWateringCanService } from "./use-watering-can.service"
import { UseWateringCanGateway } from "./use-watering-can.gateway"

@Module({
    providers: [UseWateringCanService, UseWateringCanGateway],
})
export class UseWateringCanModule {} 
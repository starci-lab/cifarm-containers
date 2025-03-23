import { Module } from "@nestjs/common"
import { UseWateringCanResolver } from "./use-watering-can.resolver"
import { UseWateringCanService } from "./use-watering-can.service"

@Module({
    providers: [UseWateringCanService, UseWateringCanResolver],
})
export class UseWateringCanModule {}

import { Module } from "@nestjs/common"
import { HelpUseWateringCanGateway } from "./help-use-watering-can.gateway"
import { HelpUseWateringCanService } from "./help-use-watering-can.service"

@Module({
    providers: [HelpUseWateringCanService, HelpUseWateringCanGateway],
})
export class HelpUseWateringCanModule {} 
import { Module } from "@nestjs/common"
import { HelpUseWateringCanResolver } from "./help-use-watering-can.resolver"
import { HelpUseWateringCanService } from "./help-use-watering-can.service"

 
@Module({
    providers: [HelpUseWateringCanService, HelpUseWateringCanResolver]
})
export class HelpUseWateringCanModule {}

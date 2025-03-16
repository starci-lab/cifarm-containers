import { Module } from "@nestjs/common"
import { HelpUseFruitFertilizerController } from "./help-use-fruit-fertilizer.resolver"
import { HelpUseFruitFertilizerService } from "./help-use-fruit-fertilizer.service"

 
@Module({
    providers: [HelpUseFruitFertilizerService],
    controllers: [HelpUseFruitFertilizerController]
})
export class HelpUseFruitFertilizerModule {}

import { Module } from "@nestjs/common"
import { HelpUseFruitFertilizerResolver } from "./help-use-fruit-fertilizer.resolver"
import { HelpUseFruitFertilizerService } from "./help-use-fruit-fertilizer.service"

 
@Module({
    providers: [HelpUseFruitFertilizerService, HelpUseFruitFertilizerResolver]
})
export class HelpUseFruitFertilizerModule {}

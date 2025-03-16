import { Module } from "@nestjs/common"
import { UseFruitFertilizerResolver } from "./use-fruit-fertilizer.resolver"
import { UseFruitFertilizerService } from "./use-fruit-fertilizer.service"

@Module({
    providers: [UseFruitFertilizerService, UseFruitFertilizerResolver]
})
export class UseFruitFertilizerModule {}

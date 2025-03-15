import { Module } from "@nestjs/common"
import { UseFruitFertilizerController } from "./use-fruit-fertilizer.controller"
import { UseFruitFertilizerService } from "./use-fruit-fertilizer.service"

@Module({
    controllers: [UseFruitFertilizerController],
    providers: [UseFruitFertilizerService]
})
export class UseFruitFertilizerModule {}

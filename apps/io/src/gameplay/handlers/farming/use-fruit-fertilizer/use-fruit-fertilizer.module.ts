import { Module } from "@nestjs/common"
import { UseFruitFertilizerGateway } from "./use-fruit-fertilizer.gateway"
import { UseFruitFertilizerService } from "./use-fruit-fertilizer.service"

@Module({
    providers: [
        UseFruitFertilizerGateway,
        UseFruitFertilizerService
    ],
    exports: [
        UseFruitFertilizerService
    ]
})
export class UseFruitFertilizerModule {} 
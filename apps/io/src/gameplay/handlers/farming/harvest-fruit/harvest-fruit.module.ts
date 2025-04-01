import { Module } from "@nestjs/common"
import { HarvestFruitGateway } from "./harvest-fruit.gateway"
import { HarvestFruitService } from "./harvest-fruit.service"

@Module({
    providers: [
        HarvestFruitGateway,
        HarvestFruitService
    ],
    exports: [
        HarvestFruitService
    ]
})
export class HarvestFruitModule {} 
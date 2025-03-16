import { Module } from "@nestjs/common"
import { HarvestFruitResolver } from "./harvest-fruit.resolver"
import { HarvestFruitService } from "./harvest-fruit.service"

 
@Module({
    providers: [HarvestFruitService, HarvestFruitResolver]
})
export class HarvestFruitModule {}

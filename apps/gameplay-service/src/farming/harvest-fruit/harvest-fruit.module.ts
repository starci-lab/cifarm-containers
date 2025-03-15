import { Module } from "@nestjs/common"
import { HarvestFruitController } from "./harvest-fruit.controller"
import { HarvestFruitService } from "./harvest-fruit.service"

 
@Module({
    controllers: [HarvestFruitController],
    providers: [HarvestFruitService]
})
export class HarvestFruitModule {}

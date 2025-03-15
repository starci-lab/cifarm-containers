import { Module } from "@nestjs/common"
import { ThiefFruitController } from "./thief-fruit.controller"
import { ThiefFruitService } from "./thief-fruit.service"

 
@Module({
    providers: [ThiefFruitService],
    controllers: [ThiefFruitController]
})
export class ThiefFruitModule {}

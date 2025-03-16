import { Module } from "@nestjs/common"
import { ThiefFruitResolver } from "./thief-fruit.resolver"
import { ThiefFruitService } from "./thief-fruit.service"

 
@Module({
    providers: [ThiefFruitService, ThiefFruitResolver]
})
export class ThiefFruitModule {}

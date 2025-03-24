import { Module } from "@nestjs/common"
import { ThiefFruitGateway } from "./thief-fruit.gateway"
import { ThiefFruitService } from "./thief-fruit.service"

@Module({
    providers: [ThiefFruitService, ThiefFruitGateway],
})
export class ThiefFruitModule {} 
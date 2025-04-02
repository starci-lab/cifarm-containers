import { Module } from "@nestjs/common"
import { ThiefBeeHouseService } from "./thief-bee-house.service"
import { ThiefBeeHouseGateway } from "./thief-bee-house.gateway"

@Module({
    providers: [ThiefBeeHouseService, ThiefBeeHouseGateway],
})
export class ThiefBeeHouseModule {} 
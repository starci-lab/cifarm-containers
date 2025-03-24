import { Module } from "@nestjs/common"
import { UsePesticideService } from "./use-pesticide.service"
import { UsePesticideGateway } from "./use-pesticide.gateway"

@Module({
    providers: [UsePesticideService, UsePesticideGateway]
})
export class UsePesticideModule {} 
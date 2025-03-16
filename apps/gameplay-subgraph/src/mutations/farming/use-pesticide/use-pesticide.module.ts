import { Module } from "@nestjs/common"
import { UsePesticideResolver } from "./use-pesticide.resolver"
import { UsePesticideService } from "./use-pesticide.service"

@Module({
    providers: [UsePesticideService, UsePesticideResolver]
})
export class UsePesticideModule {}

import { Module } from "@nestjs/common"
import { UsePesticideController } from "./use-pesticide.controller"
import { UsePesticideService } from "./use-pesticide.service"

@Module({
    controllers: [UsePesticideController],
    providers: [UsePesticideService]
})
export class UsePesticideModule {}

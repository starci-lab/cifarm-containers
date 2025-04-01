import { Module } from "@nestjs/common"
import { UseFertilizerService } from "./use-fertilizer.service"
import { UseFertilizerGateway } from "./use-fertilizer.gateway"

@Module({
    providers: [UseFertilizerService, UseFertilizerGateway],
})
export class UseFertilizerModule {} 
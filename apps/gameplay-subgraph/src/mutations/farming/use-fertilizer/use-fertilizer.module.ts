import { Module } from "@nestjs/common"
import { UseFertilizerResolver } from "./use-fertilizer.resolver"
import { UseFertilizerService } from "./use-fertilizer.service"

@Module({
    providers: [UseFertilizerService, UseFertilizerResolver]
})
export class UseFertilizerModule {}

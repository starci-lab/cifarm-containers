import { Module } from "@nestjs/common"
import { UseFertilizerController } from "./use-fertilizer.controller"
import { UseFertilizerService } from "./use-fertilizer.service"

@Module({
    controllers: [UseFertilizerController],
    providers: [UseFertilizerService]
})
export class UseFertilizerModule {}

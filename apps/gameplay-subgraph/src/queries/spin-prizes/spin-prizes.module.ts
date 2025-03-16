import { Module } from "@nestjs/common"
import { SpinPrizeResolver } from "./spin-prizes.resolver"
import { SpinPrizesService } from "./spin-prizes.service"

@Module({
    providers: [SpinPrizesService, SpinPrizeResolver]
})
export class SpinPrizesModule {}
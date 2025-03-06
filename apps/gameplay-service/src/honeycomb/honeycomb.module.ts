import { Module } from "@nestjs/common"
import { ClaimHoneycombDailyRewardModule } from "./claim-honeycomb-daily-reward"
import { MintOffchainTokensModule } from "./mint-offchain-tokens"

@Module({
    imports: [ClaimHoneycombDailyRewardModule, MintOffchainTokensModule]
})
export class HoneycombModule {}

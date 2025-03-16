import { Module } from "@nestjs/common"
import { CreateSplStakingPoolCommand } from "./create-spl-staking-pool.command"


@Module({
    providers: [ CreateSplStakingPoolCommand ],
})
export class CreateSplStakingPoolModule {}
import { Logger, UseGuards } from "@nestjs/common"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"
import { Resolver, Mutation } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class ClaimDailyRewardResolver {
    private readonly logger = new Logger(ClaimDailyRewardResolver.name)

    constructor(private readonly claimDailyRewardService: ClaimDailyRewardService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "claimDailyReward" })
    public async claimDailyReward(
        @GraphQLUser() user: UserLike,
    ) {
        return this.claimDailyRewardService.claimDailyReward(user)
    }
}

import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver } from "@nestjs/graphql"
import { ClaimHoneycombDailyRewardService } from "./claim-honeycomb-daily-reward.service"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class ClaimHoneycombDailyRewardResolver {
    private readonly logger = new Logger(ClaimHoneycombDailyRewardResolver.name)

    constructor(
        private readonly claimHoneycombDailyRewardService: ClaimHoneycombDailyRewardService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "claimHoneycombDailyReward" })
    public async claimHoneycombDailyReward(
        @GraphQLUser() user: UserLike,
    ) {
        return this.claimHoneycombDailyRewardService.claimHoneycombDailyReward(user)
    }
}

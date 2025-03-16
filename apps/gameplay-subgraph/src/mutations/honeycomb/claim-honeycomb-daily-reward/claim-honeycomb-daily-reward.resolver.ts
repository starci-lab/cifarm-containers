import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver } from "@nestjs/graphql"
import { ClaimHoneycombDailyRewardService } from "./claim-honeycomb-daily-reward.service"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class ClaimHoneycombDailyRewardResolver {
    private readonly logger = new Logger(ClaimHoneycombDailyRewardResolver.name)

    constructor(
        private readonly claimHoneycombDailyRewardService: ClaimHoneycombDailyRewardService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "claimHoneycombDailyReward",
        description: "Claim honeycomb daily reward",
        nullable: true
    })
    public async claimHoneycombDailyReward(
        @GraphQLUser() user: UserLike
    ) {
        return this.claimHoneycombDailyRewardService.claimHoneycombDailyReward(user)
    }
}

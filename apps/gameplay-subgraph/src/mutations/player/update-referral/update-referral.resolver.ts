import { Logger, UseGuards } from "@nestjs/common"
import { UpdateReferralService } from "./update-referral.service"
import { UpdateReferralRequest, UpdateReferralResponse } from "./update-referral.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class UpdateReferralResolver {
    private readonly logger = new Logger(UpdateReferralResolver.name)

    constructor(private readonly updateReferralService: UpdateReferralService) {}

    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => UpdateReferralResponse, {
        name: "updateReferral",
        description: "Update referral",
        nullable: true
    })
    public async updateReferral(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UpdateReferralRequest
    ) {
        return this.updateReferralService.updateReferral(user, request)
    }
}

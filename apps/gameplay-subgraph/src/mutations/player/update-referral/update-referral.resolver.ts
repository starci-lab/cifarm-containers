import { Logger, UseGuards } from "@nestjs/common"
import { UpdateReferralService } from "./update-referral.service"
import { UpdateReferralRequest } from "./update-referral.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class UpdateReferralResolver {
    private readonly logger = new Logger(UpdateReferralResolver.name)

    constructor(private readonly updateReferralService : UpdateReferralService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "updateReferral" })
    public async updateReferral(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UpdateReferralRequest
    ) {
        return this.updateReferralService.updateReferral(user, request)
    }
}

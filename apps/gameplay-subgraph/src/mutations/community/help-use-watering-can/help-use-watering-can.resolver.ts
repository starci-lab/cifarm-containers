import { Logger, UseGuards } from "@nestjs/common"
import { HelpUseWateringCanService } from "./help-use-watering-can.service"
import { HelpUseWateringCanRequest } from "./help-use-watering-can.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class HelpUseWateringCanResolver {
    private readonly logger = new Logger(HelpUseWateringCanResolver.name)

    constructor(private readonly helpUseWateringCanService: HelpUseWateringCanService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "helpUseWateringCan",
        description: "Help use watering can",
        nullable: true
    })
    public async helpUseWateringCan(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpUseWateringCanRequest
    ) {
        return this.helpUseWateringCanService.helpUseWateringCan(user, request)
    }
}

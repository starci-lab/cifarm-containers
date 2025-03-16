import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UsePesticideRequest } from "./use-pesticide.dto"
import { UsePesticideService } from "./use-pesticide.service"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"

@Resolver()
export class UsePesticideResolver {
    private readonly logger = new Logger(UsePesticideResolver.name)

    constructor(private readonly usePesticideService: UsePesticideService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "usePesticide" })
    public async usePesticide(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UsePesticideRequest
    ) {
        return this.usePesticideService.usePesticide(user, request)
    }
}

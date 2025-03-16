import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UsePesticideRequest } from "./use-pesticide.dto"
import { UsePesticideService } from "./use-pesticide.service"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class UsePesticideResolver {
    private readonly logger = new Logger(UsePesticideResolver.name)

    constructor(private readonly usePesticideService: UsePesticideService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "usePesticide", description: "Use a pesticide", nullable: true })
    public async usePesticide(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UsePesticideRequest
    ) {
        return this.usePesticideService.usePesticide(user, request)
    }
}

import { Logger, UseGuards } from "@nestjs/common"
import { UseHerbicideService } from "./use-herbicide.service"
import { UseHerbicideRequest } from "./use-herbicide.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UserLike } from "@src/jwt"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class UseHerbicideResolver {
    private readonly logger = new Logger(UseHerbicideResolver.name)

    constructor(private readonly useHerbicideService: UseHerbicideService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "useHerbicide" })
    public async useHerbicide(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UseHerbicideRequest
    ) {
        return this.useHerbicideService.useHerbicide(user, request)
    }
}

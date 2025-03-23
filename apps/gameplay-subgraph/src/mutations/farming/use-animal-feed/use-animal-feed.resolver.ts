import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { UseAnimalFeedService } from "./use-animal-feed.service"
import { UseAnimalFeedRequest } from "./use-animal-feed.dto"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class UseAnimalFeedResolver {
    private readonly logger = new Logger(UseAnimalFeedResolver.name)

    constructor(private readonly useAnimalFeedService: UseAnimalFeedService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "useAnimalFeed", description: "Use animal feed", nullable: true })
    public async useAnimalFeed(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UseAnimalFeedRequest
    ) {
        return this.useAnimalFeedService.useAnimalFeed(user, request)
    }
}

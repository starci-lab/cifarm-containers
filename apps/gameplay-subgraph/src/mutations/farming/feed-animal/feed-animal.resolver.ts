import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { FeedAnimalService } from "./feed-animal.service"
import { FeedAnimalRequest } from "./feed-animal.dto"

@Resolver()
export class FeedAnimalResolver {
    private readonly logger = new Logger(FeedAnimalResolver.name)

    constructor(private readonly feedAnimalService: FeedAnimalService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "feedAnimal" })
    public async feedAnimal(
        @GraphQLUser() user: UserLike,
        @Args("request") request: FeedAnimalRequest
    ) {
        return this.feedAnimalService.feedAnimal(user, request)
    }
}

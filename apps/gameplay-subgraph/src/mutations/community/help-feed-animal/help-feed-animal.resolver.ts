import { Logger, UseGuards } from "@nestjs/common"
import { HelpFeedAnimalService } from "./help-feed-animal.service"
import { HelpFeedAnimalRequest } from "./help-feed-animal.dto"
import { Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { Args, Mutation } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class HelpFeedAnimalResolver {
    private readonly logger = new Logger(HelpFeedAnimalResolver.name)

    constructor(private readonly helpFeedAnimalService: HelpFeedAnimalService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "helpFeedAnimal",
        description: "Help feed an animal",
        nullable: true
    })
    public async helpFeedAnimal(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpFeedAnimalRequest
    ) {
        return this.helpFeedAnimalService.helpFeedAnimal(user, request)
    }
}

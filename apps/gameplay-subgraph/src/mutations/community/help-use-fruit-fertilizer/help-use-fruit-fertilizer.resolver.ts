import { Logger, UseGuards } from "@nestjs/common"
import { HelpUseFruitFertilizerService } from "./help-use-fruit-fertilizer.service"
import { HelpUseFruitFertilizerRequest } from "./help-use-fruit-fertilizer.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class HelpUseFruitFertilizerResolver {
    private readonly logger = new Logger(HelpUseFruitFertilizerResolver.name)

    constructor(private readonly helpUseFruitFertilizerService: HelpUseFruitFertilizerService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "helpUseFruitFertilizer",
        description: "Help use fruit fertilizer",
        nullable: true
    })
    public async helpUseFruitFertilizer(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpUseFruitFertilizerRequest
    ) {
        return this.helpUseFruitFertilizerService.helpUseFruitFertilizer(user, request)
    }
}

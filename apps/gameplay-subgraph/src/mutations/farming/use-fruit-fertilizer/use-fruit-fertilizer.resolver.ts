import { Logger, UseGuards } from "@nestjs/common"
import { UseFruitFertilizerRequest } from "./use-fruit-fertilizer.dto"
import { UseFruitFertilizerService } from "./use-fruit-fertilizer.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class UseFruitFertilizerResolver {
    private readonly logger = new Logger(UseFruitFertilizerResolver.name)

    constructor(private readonly useFruitFertilizerService: UseFruitFertilizerService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "useFruitFertilizer", description: "Use a fruit fertilizer", nullable: true })
    public async useFruitFertilizer(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UseFruitFertilizerRequest
    ) {
        return this.useFruitFertilizerService.useFruitFertilizer(user, request)
    }
}

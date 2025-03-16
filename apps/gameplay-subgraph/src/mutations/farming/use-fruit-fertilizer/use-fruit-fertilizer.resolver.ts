import { Logger, UseGuards } from "@nestjs/common"
import { UseFruitFertilizerRequest } from "./use-fruit-fertilizer.dto"
import { UseFruitFertilizerService } from "./use-fruit-fertilizer.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"

@Resolver()
export class UseFruitFertilizerResolver {
    private readonly logger = new Logger(UseFruitFertilizerResolver.name)

    constructor(private readonly useFruitFertilizerService: UseFruitFertilizerService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "useFruitFertilizer" })
    public async useFruitFertilizer(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UseFruitFertilizerRequest
    ) {
        return this.useFruitFertilizerService.useFruitFertilizer(user, request)
    }
}

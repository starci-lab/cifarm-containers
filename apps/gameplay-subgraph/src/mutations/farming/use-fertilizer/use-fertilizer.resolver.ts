import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { UseFertilizerRequest } from "./use-fertilizer.dto"
import { UseFertilizerService } from "./use-fertilizer.service"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class UseFertilizerResolver {
    private readonly logger = new Logger(UseFertilizerResolver.name)

    constructor(private readonly useFertilizerService: UseFertilizerService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "useFertilizer" })
    public async useFertilizer(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UseFertilizerRequest
    ) {
        return this.useFertilizerService.useFertilizer(user, request)
    }
}

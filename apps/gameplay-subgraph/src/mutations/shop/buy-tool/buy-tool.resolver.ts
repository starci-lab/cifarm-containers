import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { BuyToolService } from "./buy-tool.service"
import { BuyToolRequest } from "./buy-tool.dto"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class BuyToolResolver {
    private readonly logger = new Logger(BuyToolResolver.name)

    constructor(private readonly buyToolService: BuyToolService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "buyTool",
        description: "Buy a tool",
        nullable: true
    })
    public async buyTool(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuyToolRequest
    ) {
        return this.buyToolService.buyTool(user, request)
    }
}

import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { GraphQLUser } from "@src/decorators"
import { BuyToolService } from "./buy-tool.service"
import { BuyToolRequest } from "./buy-tool.dto"

@Resolver()
export class BuyToolResolver {
    private readonly logger = new Logger(BuyToolResolver.name)

    constructor(private readonly buyToolService: BuyToolService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "buyTool" })
    public async buyTool(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuyToolRequest
    ): Promise<EmptyObjectType> {
        return this.buyToolService.buyTool(user, request)
    }
}

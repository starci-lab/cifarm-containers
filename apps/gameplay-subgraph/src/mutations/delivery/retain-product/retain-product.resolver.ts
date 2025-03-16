import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { RetainProductService } from "./retain-product.service"
import { RetainProductRequest } from "./retain-product.dto"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"

@Resolver()
export class RetainProductResolver {
    private readonly logger = new Logger(RetainProductResolver.name)

    constructor(private readonly retainProductService: RetainProductService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "retainProduct" })
    public async retainProduct(
        @GraphQLUser() user: UserLike,
        @Args("request") request: RetainProductRequest
    ) {
        return this.retainProductService.retainProduct(user, request)
    }
}

import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { RetainProductService } from "./retain-product.service"
import { RetainProductRequest } from "./retain-product.dto"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class RetainProductResolver {
    private readonly logger = new Logger(RetainProductResolver.name)

    constructor(private readonly retainProductService: RetainProductService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "retainProduct" })
    public async retainProduct(
        @GraphQLUser() user: UserLike,
        @Args("request") request: RetainProductRequest
    ) {
        return this.retainProductService.retainProduct(user, request)
    }
}

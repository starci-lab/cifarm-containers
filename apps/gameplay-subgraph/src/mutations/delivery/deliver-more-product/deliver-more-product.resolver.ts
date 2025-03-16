import { Logger, UseGuards } from "@nestjs/common"
import { DeliverMoreProductService } from "./deliver-more-product.service"
import { DeliverMoreProductRequest } from "./deliver-more-product.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class DeliverMoreProductResolver {
    private readonly logger = new Logger(DeliverMoreProductResolver.name)

    constructor(private readonly deliverMoreProductService: DeliverMoreProductService) { }

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "deliverMoreProduct" })
    public async deliverMoreProduct(
        @GraphQLUser() user: UserLike,
        @Args("request") request: DeliverMoreProductRequest
    ) {
        return this.deliverMoreProductService.deliverMoreProduct(user, request)
    }
}

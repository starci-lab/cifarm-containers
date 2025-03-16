import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { DeliverProductService } from "./deliver-product.service"
import { DeliverProductRequest } from "./deliver-product.dto"
import { UserLike } from "@src/jwt"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { EmptyObjectType } from "@src/common"

@Resolver()
export class DeliverProductResolver {
    private readonly logger = new Logger(DeliverProductResolver.name)

    constructor(private readonly deliverProductService: DeliverProductService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "deliverProduct" })
    public async deliverProduct(
        @GraphQLUser() user: UserLike,
        @Args("request") request: DeliverProductRequest
    ) {
        return this.deliverProductService.deliverProduct(user, request)
    }
}

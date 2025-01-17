import { Logger, UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { DeliveringProductEntity } from "@src/databases"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { DeliveringProductsService } from "./delivering-products.service"
import { GetDeliveringProductsArgs, GetDeliveringProductsResponse } from "./delivering-products.dto"

@Resolver()
export class DeliveringProductsResolver {
    private readonly logger = new Logger(DeliveringProductsResolver.name)

    constructor(private readonly deliveringProductsService: DeliveringProductsService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => DeliveringProductEntity, {
        name: "deliveringProduct",
        nullable: true
    })
    async getDeliveringProductById(
        @Args("id", { type: () => ID }) id: string
    ): Promise<DeliveringProductEntity> {
        this.logger.debug(`getDeliveringProductById: id=${id}`)
        return this.deliveringProductsService.getDeliveringProduct(id)
    }

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => GetDeliveringProductsResponse, {
        name: "deliveringProducts"
    })
    async getDeliveringProducts(
        @GraphQLUser() user: UserLike,
        @Args("args") args: GetDeliveringProductsArgs
    ): Promise<GetDeliveringProductsResponse> {
        return this.deliveringProductsService.getDeliveringProducts(user, args)
    }
}

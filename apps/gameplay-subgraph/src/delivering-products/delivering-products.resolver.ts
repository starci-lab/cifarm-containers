import { Logger } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { DeliveringProductEntity } from "@src/databases"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { DeliveringProductService } from "./delivering-products.service"
import { GetDeliveringProductsArgs } from "./delivering-products.dto"

@Resolver()
export class DeliveringProductResolver {
    private readonly logger = new Logger(DeliveringProductResolver.name)

    constructor(private readonly deliveringProductsService: DeliveringProductService) {}

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

    @Query(() => [DeliveringProductEntity], {
        name: "deliveringProducts"
    })
    async getDeliveringProducts(
        @GraphQLUser() user: UserLike,
        @Args("args") args: GetDeliveringProductsArgs
    ): Promise<Array<DeliveringProductEntity>> {
        this.logger.debug(
            `getDeliveringProductsByUserId: userId=${user?.id} args=${JSON.stringify(args)}`
        )
        return this.deliveringProductsService.getDeliveringProducts(user, args)
    }
}

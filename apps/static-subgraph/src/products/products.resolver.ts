import { GetProductsArgs } from "@apps/static-subgraph/src/products/products.dto"
import { ProductService } from "@apps/static-subgraph/src/products/products.service"
import { Logger } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { ProductEntity } from "@src/database"

@Resolver()
export class ProductResolver {
    private readonly logger = new Logger(ProductResolver.name)

    constructor(private readonly productsService: ProductService) {}
    @Query(() => [ProductEntity], {
        name: "products"
    })
    async getProducts(@Args("args") args: GetProductsArgs): Promise<Array<ProductEntity>> {
        this.logger.debug(`getProducts: args=${JSON.stringify(args)}`)
        return this.productsService.getProducts(args)
    }
}

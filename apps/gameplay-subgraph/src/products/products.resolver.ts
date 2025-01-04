import { Logger } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { ProductEntity } from "@src/databases"
import { GetProductsArgs } from "./products.dto"
import { ProductService } from "./products.service"

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

    @Query(() => ProductEntity, {
        name: "product",
        nullable:true
    })
    async getProductById(@Args("id") id: string): Promise<ProductEntity | null> {
        this.logger.debug(`getProductById: id=${id}`)
        return this.productsService.getProduct(id)
    }
}

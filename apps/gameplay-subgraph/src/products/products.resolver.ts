import { Logger } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { ProductEntity } from "@src/databases"
import { ProductService } from "./products.service"

@Resolver()
export class ProductResolver {
    private readonly logger = new Logger(ProductResolver.name)

    constructor(private readonly productsService: ProductService) {}

    @Query(() => [ProductEntity], {
        name: "products"
    })
    async getProducts(): Promise<Array<ProductEntity>> {
        return this.productsService.getProducts()
    }

    @Query(() => ProductEntity, {
        name: "product",
        nullable:true
    })
    async getProductById(@Args("id") id: string): Promise<ProductEntity | null> {
        return this.productsService.getProduct(id)
    }
}

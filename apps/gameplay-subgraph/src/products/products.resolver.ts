import { Logger } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { ProductId, ProductSchema } from "@src/databases"
import { ProductService } from "./products.service"

@Resolver()
export class ProductResolver {
    private readonly logger = new Logger(ProductResolver.name)

    constructor(private readonly productsService: ProductService) {}
    
    @Query(() => [ProductSchema], {
        name: "products"
    })
    async products(): Promise<Array<ProductSchema>> {
        return this.productsService.getProducts()
    }

    @Query(() => ProductSchema, {
        name: "product"
    })
    async product(@Args("id", { type: () => ID }) id: ProductId): Promise<ProductSchema> {
        return this.productsService.getProduct(id)
    }
}

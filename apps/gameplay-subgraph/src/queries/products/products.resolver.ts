import { Logger, UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { ProductId, ProductSchema } from "@src/databases"
import { ProductService } from "./products.service"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class ProductResolver {
    private readonly logger = new Logger(ProductResolver.name)

    constructor(private readonly productsService: ProductService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [ProductSchema], {
        name: "products",
        description: "Get all products"
    })
    products(): Array<ProductSchema> {
        return this.productsService.products()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => ProductSchema, {
        name: "product",
        description: "Get a product by ID"
    })
    product(
        @Args("id", { type: () => ID, description: "The ID of the product" }) id: ProductId
    ): ProductSchema {
        return this.productsService.product(id)
    }
}

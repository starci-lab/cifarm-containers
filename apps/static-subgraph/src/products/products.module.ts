import { ProductResolver } from "@apps/static-subgraph/src/products/products.resolver"
import { ProductService } from "@apps/static-subgraph/src/products/products.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [ProductService, ProductResolver]
})
export class ProductsModule {}

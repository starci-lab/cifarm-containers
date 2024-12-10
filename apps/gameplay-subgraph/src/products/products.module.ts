import { ProductResolver } from "@apps/gameplay-subgraph/src/products/products.resolver"
import { ProductService } from "@apps/gameplay-subgraph/src/products/products.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [ProductService, ProductResolver]
})
export class ProductsModule { 
    
}

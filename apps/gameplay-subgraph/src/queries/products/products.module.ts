import { Module } from "@nestjs/common"
import { ProductService } from "./products.service"
import { ProductResolver } from "./products.resolver"
 
@Module({
    providers: [ProductService, ProductResolver]
})
export class ProductsModule { }

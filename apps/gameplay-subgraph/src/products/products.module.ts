import { Module } from "@nestjs/common"
import { ProductService } from "./products.service"
import { ProductResolver } from "./products.resolver"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [ProductService, ProductResolver]
})
export class ProductsModule { 
    
}

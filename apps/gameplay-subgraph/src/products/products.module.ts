import { Module } from "@nestjs/common"
import { ProductService } from "./products.service"
import { ProductResolver } from "./products.resolver"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ GameplayPostgreSQLModule.forRoot() ],
    providers: [ProductService, ProductResolver]
})
export class ProductsModule { 
    
}

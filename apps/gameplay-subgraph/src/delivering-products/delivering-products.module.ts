import { Module } from "@nestjs/common"
import { DeliveringProductService } from "./delivering-products.service"
import { DeliveringProductResolver } from "./delivering-products.resolver"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ GameplayPostgreSQLModule.forRoot() ],
    providers: [DeliveringProductService, DeliveringProductResolver]
})
export class InventoriesModule {}

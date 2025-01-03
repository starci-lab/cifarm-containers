import { Module } from "@nestjs/common"
import { DeliveringProductService } from "./delivering-products.service"
import { DeliveringProductResolver } from "./delivering-products.resolver"
 

@Module({
    imports: [ ],
    providers: [DeliveringProductService, DeliveringProductResolver]
})
export class InventoriesModule {}

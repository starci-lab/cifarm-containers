import { Module } from "@nestjs/common"
import { DeliveringProductsService } from "./delivering-products.service"
import { DeliveringProductsResolver } from "./delivering-products.resolver"

@Module({
    providers: [DeliveringProductsService, DeliveringProductsResolver]
})
export class DeliveringProductsModule {}

import { Module } from "@nestjs/common"
import { DeliverProductService } from "./deliver-product.service"
import { DeliverProductResolver } from "./deliver-product.resolver"
 
@Module({
    providers: [DeliverProductService, DeliverProductResolver]
})
export class DeliverProductModule {}

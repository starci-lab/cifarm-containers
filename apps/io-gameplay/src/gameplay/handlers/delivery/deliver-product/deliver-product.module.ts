import { Module } from "@nestjs/common"
import { DeliverProductService } from "./deliver-product.service"
import { DeliverProductGateway } from "./deliver-product.gateway"

@Module({
    providers: [DeliverProductService, DeliverProductGateway]
})
export class DeliverProductModule {} 
import { Module } from "@nestjs/common"
import { DeliverMoreProductService } from "./deliver-more-product.service"
import { DeliverMoreProductGateway } from "./deliver-more-product.gateway"

@Module({
    providers: [DeliverMoreProductService, DeliverMoreProductGateway]
})
export class DeliverMoreProductModule {} 
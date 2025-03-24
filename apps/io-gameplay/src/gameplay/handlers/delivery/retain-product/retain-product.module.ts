import { Module } from "@nestjs/common"
import { RetainProductService } from "./retain-product.service"
import { RetainProductGateway } from "./retain-product.gateway"

@Module({
    providers: [RetainProductService, RetainProductGateway]
})
export class RetainProductModule {} 
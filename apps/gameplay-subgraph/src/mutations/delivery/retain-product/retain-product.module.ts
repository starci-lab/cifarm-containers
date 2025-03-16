import { Module } from "@nestjs/common"
import { RetainProductResolver } from "./retain-product.resolver"
import { RetainProductService } from "./retain-product.service"

 
@Module({
    providers: [RetainProductService, RetainProductResolver]
})
export class RetainProductModule {}

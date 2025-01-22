import { Module } from "@nestjs/common"
import { RetainProductController } from "./retain-product.controller"
import { RetainProductService } from "./retain-product.service"

 
@Module({
    providers: [RetainProductService],
    controllers: [RetainProductController]
})
export class RetainProductModule {}

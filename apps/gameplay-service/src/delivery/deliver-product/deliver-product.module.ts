import { Module } from "@nestjs/common"
import { DeliverProductController } from "./deliver-product.controller"
import { DeliverProductService } from "./deliver-product.service"

 
@Module({
    imports: [],
    providers: [DeliverProductService],
    controllers: [DeliverProductController]
})
export class DeliverProductModule {}

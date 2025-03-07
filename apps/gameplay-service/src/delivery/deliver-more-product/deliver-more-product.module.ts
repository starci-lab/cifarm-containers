import { Module } from "@nestjs/common"
import { DeliverMoreProductController } from "./deliver-more-product.controller"
import { DeliverMoreProductService } from "./deliver-more-product.service"

 
@Module({
    imports: [],
    providers: [DeliverMoreProductService],
    controllers: [DeliverMoreProductController]
})
export class DeliverMoreProductModule {}

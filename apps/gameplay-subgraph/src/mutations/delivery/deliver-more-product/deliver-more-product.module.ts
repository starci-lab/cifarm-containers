import { Module } from "@nestjs/common"
import { DeliverMoreProductService } from "./deliver-more-product.service"
import { DeliverMoreProductResolver } from "./deliver-more-product.resolver"
    
 
@Module({
    providers: [DeliverMoreProductService, DeliverMoreProductResolver]
})
export class DeliverMoreProductModule {}

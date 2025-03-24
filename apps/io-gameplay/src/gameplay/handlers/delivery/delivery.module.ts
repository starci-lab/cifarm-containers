import { Module } from "@nestjs/common"
import { DeliverProductModule } from "./deliver-product"
import { RetainProductModule } from "./retain-product"
import { DeliverMoreProductModule } from "./deliver-more-product"

@Module({
    imports: [
        DeliverProductModule,
        RetainProductModule,
        DeliverMoreProductModule
    ]
})
export class DeliveryModule {} 
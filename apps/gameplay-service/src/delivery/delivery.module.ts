import { Module } from "@nestjs/common"
import { DeliverProductModule } from "./deliver-product"
import { RetainProductModule } from "./retain-product"

@Module({
    imports: [
        DeliverProductModule,
        RetainProductModule
    ]
})
export class DeliveryModule {}

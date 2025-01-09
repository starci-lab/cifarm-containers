import { Module } from "@nestjs/common"
import { DeliveryInstantlyController } from "./deliver-instantly.controller"
import { DeliverInstantlyService } from "./deliver-instantly.service"

 
@Module({
    imports: [],
    providers: [DeliverInstantlyService],
    controllers: [DeliveryInstantlyController]
})
export class DeliveryInstantlyModule {}

import { Global, Module } from "@nestjs/common"
import { DeliveryInstantlyController } from "./deliver-instantly.controller"
import { DeliverInstantlyService } from "./deliver-instantly.service"

@Global()
@Module({
    imports: [],
    providers: [DeliverInstantlyService],
    exports: [DeliverInstantlyService],
    controllers: [DeliveryInstantlyController]
})
export class DeliveryInstantlyModule {}

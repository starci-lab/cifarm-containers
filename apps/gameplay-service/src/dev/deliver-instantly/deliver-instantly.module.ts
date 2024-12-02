import { Global, Module } from "@nestjs/common"
import { DeliveryInstantlyController } from "./deliver-instantly.controller"
import { cacheRegisterAsync, typeOrmForFeature } from "@src/dynamic-modules"
import { DeliverInstantlyService } from "./deliver-instantly.service"

@Global()
@Module({
    imports: [typeOrmForFeature(), cacheRegisterAsync()],
    providers: [DeliverInstantlyService],
    exports: [DeliverInstantlyService],
    controllers: [DeliveryInstantlyController]
})
export class DeliveryInstantlyModule {}

import { Global, Module } from "@nestjs/common"
import { DeliveryInstantlyController } from "./deliver-instantly.controller"
import { typeOrmForFeature } from "@src/dynamic-modules"
import { DeliveryInstantlyService } from "./deliver-instantly.service"

@Global()
@Module({
    imports: [typeOrmForFeature()],
    providers: [DeliveryInstantlyService],
    exports: [DeliveryInstantlyService],
    controllers: [DeliveryInstantlyController]
})
export class DeliveryInstantlyModule {}

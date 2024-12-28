import { Global, Module } from "@nestjs/common"
import { DeliveryInstantlyController } from "./deliver-instantly.controller"
import { cacheRegisterAsync,  } from "@src/dynamic-modules"
import { DeliverInstantlyService } from "./deliver-instantly.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        cacheRegisterAsync()
    ],
    providers: [DeliverInstantlyService],
    exports: [DeliverInstantlyService],
    controllers: [DeliveryInstantlyController]
})
export class DeliveryInstantlyModule {}

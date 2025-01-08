import { Global, Module } from "@nestjs/common"
import { DeliveryInstantlyController } from "./deliver-instantly.controller"
import { DeliverInstantlyService } from "./deliver-instantly.service"
import { GameplayPostgreSQLModule } from "@src/databases"
import { CacheRedisModule } from "@src/cache"

@Global()
@Module({
    imports: [
        CacheRedisModule.forFeature(),
        GameplayPostgreSQLModule.forFeature(),
    ],
    providers: [DeliverInstantlyService],
    exports: [DeliverInstantlyService],
    controllers: [DeliveryInstantlyController]
})
export class DeliveryInstantlyModule {}

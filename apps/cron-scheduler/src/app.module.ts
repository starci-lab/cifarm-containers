import { Module } from "@nestjs/common"
//import { AnimalModule } from "./animal"
import { CropModule } from "./crop"
import { DeliveryModule } from "./delivery"
import {
    bullForRoot,
    cacheRegisterAsync,
    configForRoot,
    eventEmiterForRoot,
    schedulerForRoot,
    typeOrmForRoot
} from "@src/dynamic-modules" 
import { ZooKeeperModule } from "./zookeeper"

@Module({
    imports: [
        configForRoot(),
        schedulerForRoot(),
        bullForRoot(),
        cacheRegisterAsync(),
        typeOrmForRoot(),
        eventEmiterForRoot(),
        //register here for global access
        ZooKeeperModule,
        CropModule,
        //AnimalModule,
        DeliveryModule
    ]
})
export class AppModule {}

import { Module } from "@nestjs/common"
//import { AnimalModule } from "./animal"
import { CropModule } from "./crop"
import { DeliveryModule } from "./delivery"
import {
    bullForRoot,
    cacheRegisterAsync,
    configForRoot,
    schedulerForRoot,
    typeOrmForRoot
} from "@src/dynamic-modules" 

@Module({
    imports: [
        configForRoot(),
        schedulerForRoot(),
        bullForRoot(),
        cacheRegisterAsync(),
        typeOrmForRoot(),
        CropModule,
        //AnimalModule,
        DeliveryModule
    ]
})
export class AppModule {}

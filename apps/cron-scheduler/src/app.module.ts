import { Module } from "@nestjs/common"
//import { AnimalModule } from "./animal"
import {
    bullForRoot,
    cacheRegisterAsync,
    configForRoot,
    eventEmiterForRoot,
    schedulerForRoot,
    typeOrmForRoot
} from "@src/dynamic-modules"
import { LeaderElectionModule } from "@src/services/leader-election"
import { AnimalModule } from "./animal"
import { CropModule } from "./crop"
import { DeliveryModule } from "./delivery"
@Module({
    imports: [
        configForRoot(),
        schedulerForRoot(),
        bullForRoot(),
        cacheRegisterAsync(),
        typeOrmForRoot(),
        eventEmiterForRoot(),
        //register here for global access
        LeaderElectionModule.forRoot({
            leaseName: "cron-scheduler-leader-election",
            logAtLevel: "debug",
        }),
        CropModule,
        AnimalModule,
        DeliveryModule
    ]
})
export class AppModule {}

import { Module } from "@nestjs/common"
//import { AnimalModule } from "./animal"

import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import { BullModule } from "@src/bull"
import { EnvModule } from "@src/env"
import { LeaderElectionModule } from "@src/leader-election"
import { EnergyModule } from "./energy"
import { PostgreSQLModule } from "@src/databases"
import { AnimalModule } from "./animal"
import { CropModule } from "./crop"
import { DeliveryModule } from "./delivery"
import { CacheModule } from "@src/cache"
@Module({
    imports: [
        EnvModule.forRoot(),
        ScheduleModule.forRoot(),
        BullModule.forRoot(),
        PostgreSQLModule.forRoot(),
        EventEmitterModule.forRoot(),
        CacheModule.register({
            isGlobal: true
        }),
        //register here for global access
        LeaderElectionModule.register({
            leaseName: "cron-scheduler-leader-election",
        }),
        CropModule,
        AnimalModule,
        DeliveryModule,
        EnergyModule
    ]
})
export class AppModule {}

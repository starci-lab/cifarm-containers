import { Module } from "@nestjs/common"
//import { AnimalModule } from "./animal"

import { LeaderElectionModule } from "@src/leader-election"
import { AnimalModule } from "./animal"
import { CropModule } from "./crop"
import { DeliveryModule } from "./delivery"
import { EnvModule } from "@src/env"
import { ScheduleModule } from "@nestjs/schedule"
import { BullRootModule } from "@src/bull"
import { CacheRedisModule, GameplayPostgreSQLModule } from "@src/databases"
import { EventEmitterModule } from "@nestjs/event-emitter"
@Module({
    imports: [
        EnvModule.forRoot(),
        ScheduleModule.forRoot(),
        BullRootModule.forRoot(),
        CacheRedisModule.forRoot(),
        GameplayPostgreSQLModule.forRoot(),
        EventEmitterModule.forRoot(),
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

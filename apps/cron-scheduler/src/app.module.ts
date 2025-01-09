import { Module } from "@nestjs/common"
//import { AnimalModule } from "./animal"

import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import { BullModule } from "@src/bull"
import { EnvModule } from "@src/env"
import { LeaderElectionModule } from "@src/leader-election"
import { EnergyModule } from "./energy"
import { PostgreSQLModule } from "@src/databases"
@Module({
    imports: [
        EnvModule.forRoot(),
        ScheduleModule.forRoot(),
        BullModule.forRoot(),
        PostgreSQLModule.forRoot(),
        EventEmitterModule.forRoot(),
        //register here for global access
        LeaderElectionModule.forRoot({
            leaseName: "cron-scheduler-leader-election",
            logAtLevel: "debug",
        }),
        // CropModule,
        // AnimalModule,
        // DeliveryModule,
        EnergyModule
    ]
})
export class AppModule {}

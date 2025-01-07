import { Module } from "@nestjs/common"
//import { AnimalModule } from "./animal"

import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import { BullModule } from "@src/bull"
import { GameplayPostgreSQLModule } from "@src/databases"
import { EnvModule } from "@src/env"
import { LeaderElectionModule } from "@src/leader-election"
import { AnimalModule } from "./animal"
import { CropModule } from "./crop"
import { DeliveryModule } from "./delivery"
import { EnergyModule } from "./energy"
@Module({
    imports: [
        EnvModule.forRoot(),
        ScheduleModule.forRoot(),
        BullModule.forRoot(),
        GameplayPostgreSQLModule.forRoot(),
        EventEmitterModule.forRoot(),
        //register here for global access
        LeaderElectionModule.forRoot({
            leaseName: "cron-scheduler-leader-election",
            logAtLevel: "debug",
        }),
        CropModule,
        AnimalModule,
        DeliveryModule,
        EnergyModule
    ]
})
export class AppModule {}

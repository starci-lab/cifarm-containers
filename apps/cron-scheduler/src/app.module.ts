import { Module } from "@nestjs/common"
//import { AnimalModule } from "./animal"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import { BullModule } from "@src/bull"
import { envConfig, EnvModule } from "@src/env"
import { LeaderElectionModule } from "@aurory/nestjs-k8s-leader-election"
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
        ScheduleModule.forRoot(),
        //register here for global access
        LeaderElectionModule.forRoot({
            leaseName: "cron-scheduler-leader-election",
            logAtLevel: "debug",
            awaitLeadership: true,
            namespace: envConfig().kubernetes.namespace,
            renewalInterval: 5000,
        }),
        CropModule,
        AnimalModule,
        DeliveryModule,
        EnergyModule
    ]
})
export class AppModule {}

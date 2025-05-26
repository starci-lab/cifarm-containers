import { Module } from "@nestjs/common"
//import { AnimalModule } from "./animal"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import { BullModule } from "@src/bull"
import { envConfig, EnvModule } from "@src/env"
import { EnergyModule } from "./energy"
import { AnimalModule } from "./animal"
import { PlantModule } from "./plant"
import { DeliveryModule } from "./delivery"
import { CacheModule } from "@src/cache"
import { DateModule } from "@src/date"
import { MongooseModule } from "@src/databases"
import { KafkaModule } from "@src/brokers"
import { FruitModule } from "./fruit"
import { GameplayModule } from "@src/gameplay"
import { IdModule } from "@src/id"
import { BeeHouseModule } from "./bee-house"
import { LeaderElectionModule } from "@aurory/nestjs-k8s-leader-election"

@Module({
    imports: [
        IdModule.register({
            isGlobal: true,
            name: "Cron Scheduler"
        }),
        EnvModule.forRoot(),
        ScheduleModule.forRoot(),
        BullModule.forRoot(),
        MongooseModule.forRoot(),
        EventEmitterModule.forRoot({
            global: true
        }),
        GameplayModule.register({
            isGlobal: true
        }),
        DateModule.register({
            isGlobal: true
        }),
        CacheModule.register({
            isGlobal: true
        }),
        KafkaModule.register({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        LeaderElectionModule.forRoot({
            leaseName: "cron-scheduler-leader-election",
            logAtLevel: "debug",
            namespace: envConfig().kubernetes.namespace,
            renewalInterval: 10000,
            awaitLeadership: true,
        }),
        AnimalModule,
        DeliveryModule,
        EnergyModule,
        FruitModule,
        BeeHouseModule,
        PlantModule
    ]
})
export class AppModule {}

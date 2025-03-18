import { Module } from "@nestjs/common"
//import { AnimalModule } from "./animal"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import { BullModule } from "@src/bull"
import { EnvModule } from "@src/env"
import { EnergyModule } from "./energy"
import { AnimalModule } from "./animal"
import { CropModule } from "./crop"
import { DeliveryModule } from "./delivery"
import { CacheModule } from "@src/cache"
import { KubernetesModule } from "@src/kubernetes"
import { DateModule } from "@src/date"
import { MongooseModule } from "@src/databases"
import { KafkaModule } from "@src/brokers"
import { FruitModule } from "./fruit"
import { GameplayModule } from "@src/gameplay"
import { IdModule } from "@src/id"
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
        //register here for global access
        KubernetesModule.register({
            isGlobal: true,
            leaderElection: {
                enabled: true,
                leaseName: "cron-scheduler-leader-election",
                useMinikubeForDevelopment: true,
            }
        }),
        CropModule,
        AnimalModule,
        DeliveryModule,
        EnergyModule,
        FruitModule
    ]
})
export class AppModule {}

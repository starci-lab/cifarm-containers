import { Module } from "@nestjs/common"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import { BullModule } from "@src/bull"
import { EnvModule } from "@src/env"
import { EnergyModule } from "./energy"
import { AnimalModule } from "./animal"
import { PlantModule } from "./plant"
import { DeliveryModule } from "./delivery"
import { CacheModule } from "@src/cache"
import { DateModule } from "@src/date"
import { MongooseModule } from "@src/databases"
import { FruitModule } from "./fruit"
import { GameplayModule } from "@src/gameplay"
import { IdModule } from "@src/id"
import { BeeHouseModule } from "./bee-house"
import { MigrateModule } from "./migrate"
import { ElasticsearchModule } from "@src/elasticsearch"
@Module({
    imports: [
        IdModule.register({
            isGlobal: true,
            name: "Cron Scheduler"
        }),
        EnvModule.forRoot(),
        ScheduleModule.forRoot({
            timeouts: true,
        }),
        ElasticsearchModule.register({
            isGlobal: true
        }),
        BullModule.forRoot(),
        MongooseModule.forRoot(),
        EventEmitterModule.forRoot({
            global: true,
            maxListeners: 100
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
        ScheduleModule.forRoot(),
        AnimalModule,
        DeliveryModule,
        MigrateModule,
        EnergyModule,
        FruitModule,
        BeeHouseModule,
        PlantModule
    ]
})
export class AppModule {}

import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { BullModule } from "@src/bull"
import { EnvModule } from "@src/env"
import { AnimalModule } from "./animal"
import { CropModule } from "./crop"
import { DeliveryModule } from "./delivery"
import { EnergyModule } from "./energy"
import { GameplayModule } from "@src/gameplay"
import { DateModule } from "@src/date"
import { MongooseModule } from "@src/databases"

@Module({
    imports: [
        EnvModule.forRoot(),
        BullModule.forRoot(),
        ScheduleModule.forRoot(),
        MongooseModule.forRoot(),
        DateModule.register({
            isGlobal: true
        }),
        GameplayModule.register({
            isGlobal: true
        }),
        CropModule,
        AnimalModule,
        DeliveryModule,
        EnergyModule
    ]
})
export class AppModule {}

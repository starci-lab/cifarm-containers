import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { BullModule } from "@src/bull"
import { GameplayPostgreSQLModule } from "@src/databases"
import { EnvModule } from "@src/env"
import { AnimalModule } from "./animal"
import { CropModule } from "./crop"
import { DeliveryModule } from "./delivery"
import { EnergyModule } from "./energy"

@Module({
    imports: [
        EnvModule.forRoot(),
        BullModule.forRoot(),
        ScheduleModule.forRoot(),
        GameplayPostgreSQLModule.forRoot(),
        CropModule,
        AnimalModule,
        DeliveryModule,
        EnergyModule
    ]
})
export class AppModule {}

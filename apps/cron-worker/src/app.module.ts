import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { BullModule } from "@src/bull"
import { EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { AnimalModule } from "./animal"
import { CropModule } from "./crop"
import { DeliveryModule } from "./delivery"
import { EnergyModule } from "./energy"
import { PostgreSQLModule } from "@src/databases"
import { GameplayModule } from "@src/gameplay"
import { DateModule } from "@src/date"

@Module({
    imports: [
        EnvModule.forRoot(),
        BullModule.forRoot(),
        ScheduleModule.forRoot(),
        PostgreSQLModule.forRoot({
            context: PostgreSQLContext.Main,
            database: PostgreSQLDatabase.Gameplay
        }),
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

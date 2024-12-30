import { Module } from "@nestjs/common"
import { CropModule } from "./crop"
import { AnimalModule } from "./animal"
import { DeliveryModule } from "./delivery"
import { EnvModule } from "@src/env"
import { BullModule } from "@src/bull"
import { ScheduleModule } from "@nestjs/schedule"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        EnvModule.forRoot(),
        BullModule.forRoot(),
        ScheduleModule.forRoot(),
        GameplayPostgreSQLModule.forRoot(),
        CropModule,
        AnimalModule,
        DeliveryModule
    ]
})
export class AppModule {}

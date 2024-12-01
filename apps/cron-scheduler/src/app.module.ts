import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { envConfig } from "@src/config"
import { AnimalsModule } from "./animals"
import { CropsModule } from "./crops"
import { DeliveryModule } from "./delivery"
import { configForRoot, typeOrmForRoot } from "@src/dynamic-modules"

@Module({
    imports: [
        configForRoot(),
        ScheduleModule.forRoot(),
        BullModule.forRoot({
            connection: {
                host: envConfig().database.redis.job.host,
                port: envConfig().database.redis.job.port
            }
        }),
        typeOrmForRoot(),
        CropsModule,
        AnimalsModule,
        DeliveryModule
    ]
})
export class AppModule {}

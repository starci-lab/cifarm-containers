import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"
import { CropsModule } from "./crops"
import { BullModule } from "@nestjs/bullmq"
import { typeOrmForRoot } from "@src/dynamic-modules"
import { ScheduleModule } from "@nestjs/schedule"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true
        }),
        BullModule.forRoot({
            connection: {
                host: envConfig().database.redis.job.host,
                port: envConfig().database.redis.job.port
            }
        }),
        ScheduleModule.forRoot(),
        typeOrmForRoot(),
        CropsModule
        //AnimalsModule
    ]
})
export class AppModule {}

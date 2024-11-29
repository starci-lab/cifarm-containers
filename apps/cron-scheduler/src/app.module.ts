import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ScheduleModule } from "@nestjs/schedule"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { AnimalsModule } from "./animals"
import { CropsModule } from "./crops"
import { DeliveryModule } from "./delivery"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true
        }),
        ScheduleModule.forRoot(),
        BullModule.forRoot({
            connection: {
                host: envConfig().database.redis.job.host,
                port: envConfig().database.redis.job.port
            }
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: envConfig().database.postgres.gameplay.main.host,
            port: envConfig().database.postgres.gameplay.main.port,
            username: envConfig().database.postgres.gameplay.main.user,
            password: envConfig().database.postgres.gameplay.main.pass,
            database: envConfig().database.postgres.gameplay.main.dbName,
            autoLoadEntities: true,
            synchronize: true,
            connectTimeoutMS: 2000
        }),
        CropsModule,
        AnimalsModule,
        DeliveryModule
    ]
})
export class AppModule {}

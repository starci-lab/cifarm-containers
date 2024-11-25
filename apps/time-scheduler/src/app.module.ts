import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"
import { BullModule } from "@nestjs/bullmq"
import { AnimalModule } from "./animals"
import { CropModule } from "./crops"

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
                port: envConfig().database.redis.job.port,
            },
        }),
        AnimalModule,
        CropModule
    ],
})
export class AppModule {}

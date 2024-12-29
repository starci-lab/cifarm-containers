import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { envConfig } from "@src/env"

@Module({})
export class BullRootModule {
    public static forRoot() {
        return {
            module: BullRootModule,
            imports: [
                BullModule.forRoot({
                    connection: {
                        host: envConfig().database.redis.job.host,
                        port: envConfig().database.redis.job.port
                    }
                })
            ],
            providers: [],
            exports: []
        }
    }
}
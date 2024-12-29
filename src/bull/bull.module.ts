import { Module } from "@nestjs/common"
import { BullRegisterOptions } from "./bull.types"
import { bullData } from "./bull.constants"
import { BullModule as NestBullModule } from "@nestjs/bullmq"
import { envConfig } from "@src/env"

@Module({})
export class BullModule { 
    // register the queue
    public static registerQueue(options: BullRegisterOptions) {
        return {
            module: BullModule,
            imports: [
                NestBullModule.registerQueue({
                    name: bullData[options.queueName].name
                })
            ],
            providers: [],
            exports: []
        }
    }

    // for root
    public static forRoot() {
        return {
            module: BullModule,
            imports: [
                NestBullModule.forRoot({
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
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { RedisIoAdapter } from "@src/adapters"
import { envConfig, kafkaConfig } from "@src/config"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { v4 } from "uuid"
import { kafkaBrokers } from "@src/dynamic-modules"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    console.log(kafkaBrokers(false))
    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.KAFKA,
            options: {
                client: {
                    clientId: `websocket-node-${v4()}`,
                    brokers: kafkaBrokers(false),
                },
                consumer: {
                    groupId: kafkaConfig.placedItems.groupId,
                },
            }
        }
    )
 
    const redisIoAdapter = new RedisIoAdapter(app)
    await redisIoAdapter.connectToRedis()
    app.useWebSocketAdapter(redisIoAdapter)
    
    await app.startAllMicroservices()
    await app.listen(envConfig().containers.websocketNode.port)
}
bootstrap()

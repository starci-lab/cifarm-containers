import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { RedisIoAdapter } from "@src/adapters"
import { envConfig, kafkaConfig } from "@src/config"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { v4 } from "uuid"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)

    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.KAFKA,
            options: {
                client: {
                    clientId: `websocket-node-${v4()}`,
                    brokers: [
                        `${envConfig().kafka.default.default1.host}:${envConfig().kafka.default.default1.port}`,
                    ],
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
    await app.listen(envConfig().containers.websocketApiGateway.port)
}
bootstrap()

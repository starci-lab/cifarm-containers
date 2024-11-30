import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { RedisIoAdapter } from "@src/adapters"
import { envConfig, kafkaConfig } from "@src/config"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)

    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.KAFKA,
            options: {
                client: {
                    brokers: Object.values(envConfig().kafka.brokers),
                },
                consumer: {
                    groupId: kafkaConfig.broadcastPlacedItems.groupId,
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

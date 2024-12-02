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
                    brokers: [
                        `${envConfig().kafka.brokers.broker1.host}:${envConfig().kafka.brokers.broker1.port}`,
                        `${envConfig().kafka.brokers.broker2.host}:${envConfig().kafka.brokers.broker2.port}`,
                        `${envConfig().kafka.brokers.broker3.host}:${envConfig().kafka.brokers.broker3.port}`,
                    ],
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

import { NestFactory } from "@nestjs/core"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { KafkaGroupId } from "@src/brokers"
import { Container, envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { RedisIoAdapter } from "@src/io"
import { AppModule } from "./app.module"
import { KafkaOptionsFactory } from "@src/brokers"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    const options = app.get(KafkaOptionsFactory)
    
    // Connect to Kafka microservice
    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.KAFKA,
            options: {
                client: options.createKafkaConfig(),
                consumer: {
                    groupId: KafkaGroupId.PlacedItemsBroadcast
                },
            }
        }
    )

    // Use redis adapter for websocket
    const redisIoAdapter = app.get(RedisIoAdapter)
    await redisIoAdapter.connectToRedis()
    app.useWebSocketAdapter(redisIoAdapter)
    
    await app.startAllMicroservices()
    await app.listen(envConfig().containers[Container.WebsocketNode].port)
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(
        HealthCheckModule.forRoot({
            dependencies: [
                HealthCheckDependency.Kafka,
                HealthCheckDependency.GameplayPostgreSQL,
            ]
        })
    )
    await app.listen(envConfig().containers[Container.WebsocketNode].healthCheckPort)
}
bootstrap().then(bootstrapHealthCheck)

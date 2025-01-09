import { NestFactory } from "@nestjs/core"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { KafkaGroupId } from "@src/brokers"
import { Brokers, Container, envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { RedisIoAdapter } from "@src/io"
import { v4 } from "uuid"
import { AppModule } from "./app.module"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.KAFKA,
            options: {
                client: {
                    clientId: v4(),
                    brokers: [
                        `${envConfig().brokers[Brokers.Kafka].host}:${envConfig().brokers[Brokers.Kafka].port}`
                    ],
                    sasl: {
                        mechanism: "scram-sha-256",
                        username: envConfig().brokers[Brokers.Kafka].sasl.username,
                        password: envConfig().brokers[Brokers.Kafka].sasl.password
                    }
                },
                consumer: {
                    groupId: KafkaGroupId.PlacedItemsBroadcast
                },
            }
        }
    )
 
    const redisIoAdapter = new RedisIoAdapter(app)
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

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { RedisIoAdapter } from "@src/ws"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { HealthCheckModule } from "./health-check"
import { envConfig } from "@src/env"
import { KafkaGroupId } from "@src/brokers"
import { v4 } from "uuid"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.KAFKA,
            options: {
                client: {
                    clientId: v4(),
                    brokers: [
                        `${envConfig().messageBrokers.kafka.host}:${envConfig().messageBrokers.kafka.port}`
                    ],
                    sasl: {
                        mechanism: "scram-sha-256",
                        username: envConfig().messageBrokers.kafka.username,
                        password: envConfig().messageBrokers.kafka.password
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
    await app.listen(envConfig().containers.websocketNode.port)
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule)
    await app.listen(envConfig().containers.websocketNode.healthCheckPort)
}
bootstrap().then(bootstrapHealthCheck)

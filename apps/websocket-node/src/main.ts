import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { RedisIoAdapter } from "@src/adapters"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { v4 } from "uuid"
import { HealthCheckModule } from "./health-check"
import { envConfig } from "@src/env"
import { kafkaBrokers, KafkaGroupId } from "@src/brokers"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.KAFKA,
            options: {
                client: {
                    clientId: `websocket-node-${v4()}`,
                    brokers: kafkaBrokers(false),
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

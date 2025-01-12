import { NestFactory } from "@nestjs/core"
import { Container, envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { AppModule } from "./app.module"
import { IO_ADAPTER_FACTORY, IoAdapterFactory } from "@src/io"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { KafkaOptionsFactory, KafkaGroupId } from "@src/brokers"
import { RedisIoAdapter } from "./d"

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
    await app.startAllMicroservices()
    
    // Use adapter for websocket
    const factory = app.get<IoAdapterFactory>(IO_ADAPTER_FACTORY)
    const adapter = factory.createAdapter(app)
    await adapter.connect()
    console.log(adapter)

    // Use adapter for websocket
    app.useWebSocketAdapter(adapter)
    
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

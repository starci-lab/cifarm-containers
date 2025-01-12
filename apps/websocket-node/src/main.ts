import { NestFactory } from "@nestjs/core"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { KafkaGroupId, KafkaOptionsFactory } from "@src/brokers"
import { Container, envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { AppModule } from "./app.module"
import { IO_ADAPTER, IoAdapter } from "@src/io"

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

    //Use adapter for websocket
    const ioAdapter = app.get<IoAdapter>(IO_ADAPTER)
    await ioAdapter.connect()
    app.useWebSocketAdapter(ioAdapter)
    
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

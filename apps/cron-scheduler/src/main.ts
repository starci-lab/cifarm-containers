import { NestFactory } from "@nestjs/core"
import { Container, envConfig } from "@src/env"
import { AppModule } from "./app.module"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { KafkaGroupId, kafkaOptions } from "@src/brokers"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.KAFKA,
        options: {
            client: kafkaOptions(),
            consumer: {
                groupId: KafkaGroupId.Delivery
            }
        }
    })
    app.enableShutdownHooks()
    await app.listen()
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule.forRoot({
        dependencies: [
            HealthCheckDependency.CacheRedis,
            HealthCheckDependency.GameplayPostgreSQL,
        ]
    }))
    await app.listen(envConfig().containers[Container.CronScheduler].healthCheckPort)
}

bootstrap().then(bootstrapHealthCheck)

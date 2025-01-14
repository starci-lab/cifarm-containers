import { NestFactory } from "@nestjs/core"
import { GrpcOptions, Transport } from "@nestjs/microservices"
import { Container, envConfig } from "@src/env"
import { getGrpcData, GrpcName } from "@src/grpc"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { AppModule } from "./app.module"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<GrpcOptions>(AppModule, {
        transport: Transport.GRPC,
        options: getGrpcData(GrpcName.Gameplay).nestConfig
    })
    await app.listen()
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(
        HealthCheckModule.forRoot({
            dependencies: [
                HealthCheckDependency.CacheRedis,
                HealthCheckDependency.GameplayPostgreSQL,
                HealthCheckDependency.Kafka
            ]
        })
    )
    await app.listen(envConfig().containers[Container.GameplayService].healthCheckPort)
}

bootstrap().then(bootstrapHealthCheck)

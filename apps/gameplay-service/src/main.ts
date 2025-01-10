import { NestFactory } from "@nestjs/core"
import { GrpcOptions, Transport } from "@nestjs/microservices"
import { Container, envConfig } from "@src/env"
import { GrpcOptionsFactory } from "@src/grpc"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { AppModule } from "./app.module"

const bootstrap = async () => {
    // create config app
    const configApp = await NestFactory.create(AppModule)
    const options = configApp.get(GrpcOptionsFactory).createGrpcConfig()

    // create grpc app
    const app = configApp.connectMicroservice<GrpcOptions>({
        transport: Transport.GRPC,
        options
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

import { NestFactory } from "@nestjs/core"
import { grpcData, GrpcServiceName } from "@src/grpc"
import { Container, envConfig } from "@src/env"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { getLoopbackAddress } from "@src/common"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { AppModule } from "./app.module"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: getLoopbackAddress(envConfig().containers[Container.GameplayService].port),
            package: grpcData[GrpcServiceName.Gameplay].package,
            protoPath: grpcData[GrpcServiceName.Gameplay].protoPath
        }
    })
    await app.listen()
}

const bootstrapHealthCheck = async () => {
    // const app = await NestFactory.create(
    //     HealthCheckModule.forRoot({
    //         dependencies: [
    //             HealthCheckDependency.CacheRedis,
    //             HealthCheckDependency.GameplayPostgreSQL,
    //             HealthCheckDependency.Kafka
    //         ]
    //     })
    // )
    // await app.listen(envConfig().containers.gameplayService.healthCheckPort)
}

bootstrap().then()

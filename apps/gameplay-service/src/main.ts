import { NestFactory } from "@nestjs/core"
import { envConfig, grpcConfig, GrpcServiceName } from "@src/config"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { getLoopbackAddress } from "@src/utils"
import { HealthCheckModule } from "./health-check"
import { AppModule } from "./app.module"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: getLoopbackAddress(envConfig().containers.gameplayService.port),
            package: grpcConfig[GrpcServiceName.Gameplay].package,
            protoPath: grpcConfig[GrpcServiceName.Gameplay].protoPath
        }
    })
    await app.listen()
} 


const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule)
    await app.listen(envConfig().containers.gameplayService.healthCheckPort)
}

bootstrap().then(bootstrapHealthCheck)
  
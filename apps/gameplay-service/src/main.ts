import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig, grpcConfig, GrpcServiceName } from "@src/config"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { getLoopbackAddress } from "@src/utils"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            url: getLoopbackAddress(envConfig().containers.gameplayService.port),
            package: grpcConfig[GrpcServiceName.Gameplay].package,
            protoPath: grpcConfig[GrpcServiceName.Gameplay].protoPath
        }
    })
    await app.startAllMicroservices()
    // microservice will listen the rest on the healthcheck port
    await app.listen(envConfig().containers.gameplayService.healthCheckPort)
} 
bootstrap()
  
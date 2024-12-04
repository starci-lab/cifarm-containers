import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig, grpcConfig, GrpcServiceName } from "@src/config"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: `0.0.0.0:${envConfig().containers.gameplayService.port}`,
            package: grpcConfig[GrpcServiceName.Gameplay].package,
            protoPath: grpcConfig[GrpcServiceName.Gameplay].protoPath
        }
    })
    await app.listen()
} 
bootstrap()
  
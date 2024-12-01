import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig, grpcConfig } from "@src/config"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: `${envConfig().containers.gameplayService.host}:${envConfig().containers.gameplayService.port}`,
            package: grpcConfig.gameplay.package,
            protoPath: grpcConfig.gameplay.protoPath
        }
    })
    await app.listen()
}
bootstrap()

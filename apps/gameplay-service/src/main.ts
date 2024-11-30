import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/config"
import { gameplayGrpcConstants } from "./app.constants"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: `${envConfig().containers.gameplayService.host}:${envConfig().containers.gameplayService.port}`,
            package: gameplayGrpcConstants.PACKAGE,
            protoPath: gameplayGrpcConstants.PROTO_PATH
        }
    })
    await app.listen()
}
bootstrap()

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { envConfig } from "@src/config"
import { userGrpcConstants } from "./app.constants"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: `${envConfig().containers.walletService.host}:${envConfig().containers.walletService.port}`,
            package: userGrpcConstants.PACKAGE,
            protoPath: userGrpcConstants.PROTO_PATH
        }
    })

    await app.listen()
}
bootstrap()

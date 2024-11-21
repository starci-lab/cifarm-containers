import { NestFactory } from "@nestjs/core"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { envConfig } from "@src/config"
import { staticGrpcConstants } from "./constants"
import { AppModule } from "./app.module"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: `${envConfig().containers.staticService.host}:${envConfig().containers.staticService.port}`,
            package: staticGrpcConstants.PACKAGE,
            protoPath: staticGrpcConstants.PROTO_PATH
        }
    })

    await app.listen()
}
bootstrap()

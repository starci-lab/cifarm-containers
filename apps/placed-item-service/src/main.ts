import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { envConfig } from "@src/config"
import { placedItemGrpcConstants } from "./app.constants"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: `${envConfig().containers.placedItemService.host}:${envConfig().containers.placedItemService.port}`,
            package: placedItemGrpcConstants.PACKAGE,
            protoPath: placedItemGrpcConstants.PROTO_PATH
        }
    })

    await app.listen()
}
bootstrap()

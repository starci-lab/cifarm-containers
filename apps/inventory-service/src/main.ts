import { NestFactory } from "@nestjs/core"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { AppModule } from "./app.module"
import { envConfig } from "@src/config"
import { inventoryGrpcConstants } from "./constants"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: `${envConfig().containers.inventoryService.host}:${envConfig().containers.inventoryService.port}`,
            package: inventoryGrpcConstants.PACKAGE,
            protoPath: inventoryGrpcConstants.PROTO_PATH
        }
    })

    await app.listen()
}
bootstrap()

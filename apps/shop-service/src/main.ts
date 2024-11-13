import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/config"
import { shopGrpcConstants } from "./constants"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.GRPC,
            options: {
                url: `${envConfig().containers.shopService.host}:${envConfig().containers.shopService.port}`,
                package: shopGrpcConstants.PACKAGE,
                protoPath: shopGrpcConstants.PROTO_PATH,
            },
        },
    )

    await app.listen()
}
bootstrap()

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { envConfig } from "@src/config"
import { goldWalletGrpcConstants } from "./constants"

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.GRPC,
            options: {
                url: `${envConfig().containers.goldWalletService.host}:${envConfig().containers.goldWalletService.port}`,
                package: goldWalletGrpcConstants.PACKAGE,
                protoPath: goldWalletGrpcConstants.PROTO_PATH,
            },
        },
    )

    await app.listen()
}
bootstrap()

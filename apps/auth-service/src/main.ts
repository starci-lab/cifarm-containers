import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { authGrpcConstants } from "./constants"
import { ExceptionFilter } from "@src/filters"

const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.GRPC,
            options: {
                url: "0.0.0.0:3005",
                package: authGrpcConstants.PACKAGE,
                protoPath: authGrpcConstants.PROTO_PATH,
            },
        },
    )

    // Apply the global filter
    app.useGlobalFilters(new ExceptionFilter())

    await app.listen()
}
bootstrap()

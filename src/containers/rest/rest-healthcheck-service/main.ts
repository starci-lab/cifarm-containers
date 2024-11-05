import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { grpcConstants } from "./constant"


const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.GRPC,
            options: {
                url: "0.0.0.0:3002",
                package: grpcConstants.PACKAGE,
                protoPath: grpcConstants.PROTO_PATH,
            },
        },
    )
    await app.listen()
}  
bootstrap() 
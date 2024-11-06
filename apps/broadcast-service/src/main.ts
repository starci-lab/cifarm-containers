import { NestFactory } from "@nestjs/core"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { AppModule } from "./app.module"
import { broadcastGrpcConstants } from "./constant"


const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.GRPC,
            options: {
                url: "0.0.0.0:3004",
                package: broadcastGrpcConstants.PACKAGE,
                protoPath: broadcastGrpcConstants.PROTO_PATH,
            },
        },
    )
    await app.listen()
}  
bootstrap() 
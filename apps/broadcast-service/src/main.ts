import { NestFactory } from "@nestjs/core"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { AppModule } from "./app.module"
import { broadcastGrpcConstants } from "./constants"
import { ExceptionFilter } from "@src/filters"
import { envConfig } from "@src/config"


const bootstrap = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.GRPC,
            options: {
                url: `0.0.0.0:${envConfig().containers.broadcastService.port}`,
                package: broadcastGrpcConstants.PACKAGE,
                protoPath: broadcastGrpcConstants.PROTO_PATH,
            },
        },
    )

    // Apply the global filter
    app.useGlobalFilters(new ExceptionFilter())

    await app.listen()
}  
bootstrap() 

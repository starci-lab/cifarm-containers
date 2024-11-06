import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { AuthController } from "./auth.controller"
import { authGrpcConstants } from "@apps/auth-service"

@Module({
    imports: [
        ClientsModule.registerAsync(
            [{
                name: authGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: "0.0.0.0:3005",
                        package: authGrpcConstants.PACKAGE,
                        protoPath: authGrpcConstants.PROTO_PATH
                    },
                })}
            ]
        ),
    ],
    controllers: [AuthController],
    providers: [],
})
export class AuthModule {}
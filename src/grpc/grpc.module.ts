import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { grpcData, grpcUrlMap } from "./grpc.constants"
import { GrpcRegisterOptions } from "./grpc.types"
import { GrpcService } from "./grpc.service"

@Module({})
export class GrpcModule {
    public static register(options: GrpcRegisterOptions) {
        const url = grpcUrlMap()[options.name]
        const data = grpcData[options.name]
        return {
            module: GrpcModule,
            imports: [
                ClientsModule.registerAsync([
                    {
                        name: data.name,
                        useFactory: async () => ({
                            transport: Transport.GRPC,
                            options: {
                                url,
                                package: data.package,
                                protoPath: data.protoPath
                            }
                        })
                    }
                ])
            ],
            providers: [
                GrpcService
            ],
            exports: [
                GrpcService
            ]
        }
    }
}
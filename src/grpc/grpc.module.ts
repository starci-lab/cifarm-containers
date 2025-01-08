import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { ConfigurableModuleClass } from "@src/brokers"
import { grpcData, grpcUrlMap } from "./grpc.constants"
import { OPTIONS_TYPE } from "./grpc.module-definition"
import { GrpcService } from "./grpc.service"

@Module({})
export class GrpcModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE) {
        const url = grpcUrlMap()[options.name]
        const data = grpcData[options.name]

        const dynamicModule = super.register(options)
        return {
            ...dynamicModule,
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
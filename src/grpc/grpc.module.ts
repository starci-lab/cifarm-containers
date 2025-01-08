import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { ConfigurableModuleClass } from "@src/brokers"
import { grpcData, grpcUrlMap } from "./grpc.constants"
import { OPTIONS_TYPE } from "./grpc.module-definition"
import { GrpcServiceName } from "./grpc.types"

@Module({})
export class GrpcModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}) {
        const url = grpcUrlMap()[options.name] ?? grpcUrlMap()[GrpcServiceName.Gameplay]
        const data = grpcData[options.name] ?? grpcData[GrpcServiceName.Gameplay]

        const grpcDynamicModule = ClientsModule.registerAsync([
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

        const dynamicModule = super.register(options)
        return {
            ...dynamicModule,
            imports: [
                grpcDynamicModule
            ],
            exports: [
                grpcDynamicModule
            ]
            
        }
    }
}
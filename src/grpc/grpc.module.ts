import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { ConfigurableModuleClass } from "@src/brokers"
import { OPTIONS_TYPE } from "./grpc.module-definition"
import { GrpcName } from "./grpc.types"
import { GrpcOptionsFactory, GrpcOptionsModule } from "./options"
import { getGrpcToken } from "./grpc.utils"

@Module({})
export class GrpcModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}) {
        const name = options.name ?? GrpcName.Gameplay
        const grpcDynamicModule = ClientsModule.registerAsync([
            {
                name: getGrpcToken(name),
                imports: [
                    GrpcOptionsModule.register({
                        options
                    })
                ],
                inject: [GrpcOptionsFactory],
                useFactory: (grpcOptionsFactory: GrpcOptionsFactory) => ({
                    transport: Transport.GRPC,
                    options: grpcOptionsFactory.createGrpcConfig()
                })
            }
        ])

        const dynamicModule = super.register(options)
        return {
            ...dynamicModule,
            imports: [grpcDynamicModule],
            exports: [grpcDynamicModule]
        }
    }
}

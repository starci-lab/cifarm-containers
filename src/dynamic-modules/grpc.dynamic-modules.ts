import { ClientsModule, Transport } from "@nestjs/microservices"
import { grpcConfig, envConfig, GrpcServiceName } from "@src/config"

export const grpcClientRegisterAsync = (name: GrpcServiceName) => {
    const data = grpcConfig[name]

    //map to url
    const urlMap = () : Record<GrpcServiceName, string> => ({
        [GrpcServiceName.Gameplay]: `${envConfig().containers.gameplayService.host}:${envConfig().containers.gameplayService.port}`
    })

    return ClientsModule.registerAsync([
        {
            name: data.name,
            useFactory: async () => ({
                transport: Transport.GRPC,
                options: {
                    url: urlMap()[name],
                    package: data.package,
                    protoPath: data.protoPath
                }
            })
        }
    ])
}

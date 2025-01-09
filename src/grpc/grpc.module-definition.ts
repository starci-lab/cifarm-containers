import { ConfigurableModuleBuilder } from "@nestjs/common"
import { GrpcOptions } from "./grpc.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<GrpcOptions>()
        .setExtras(
            {
                isGlobal: false,
            },
            (definition, extras) => ({
                ...definition,
                global: extras.isGlobal,
            }),
        )
        .build()

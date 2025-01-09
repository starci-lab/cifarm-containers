import { ConfigurableModuleBuilder } from "@nestjs/common"
import { GrpcOptionsOptions } from "./options.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<GrpcOptionsOptions>()
        .setExtras({ isGlobal: false }, (defintion, extras) => ({
            ...defintion,
            global: extras.isGlobal
        }))
        .build()

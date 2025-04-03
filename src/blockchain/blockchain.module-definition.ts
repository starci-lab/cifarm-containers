import { ConfigurableModuleBuilder } from "@nestjs/common"
import { BlockchainOptions } from "./types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<BlockchainOptions>()
        .setExtras({ isGlobal: false }, (defintion, extras) => ({
            ...defintion,
            global: extras.isGlobal
        }))
        .build()
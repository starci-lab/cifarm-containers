import { ConfigurableModuleBuilder } from "@nestjs/common"
import { KafkaOptions } from "./types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<KafkaOptions>()
        .setExtras({ isGlobal: false }, (defintion, extras) => ({
            ...defintion,
            global: extras.isGlobal
        }))
        .build()

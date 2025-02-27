import { ConfigurableModuleBuilder } from "@nestjs/common"
import { HoneycombOptions } from "./types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<HoneycombOptions>()
        .setExtras(
            {
                isGlobal: false
            },
            (definition, extras) => ({
                ...definition,
                global: extras.isGlobal
            })
        )
        .build()

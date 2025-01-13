import { ConfigurableModuleBuilder } from "@nestjs/common"
import { TestingOptions } from "./testing.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<TestingOptions>()
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

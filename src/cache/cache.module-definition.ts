import { ConfigurableModuleBuilder } from "@nestjs/common"
import { CacheOptions } from "./cache.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<CacheOptions>().setClassMethodName("forRoot").setExtras({
        isGlobal: false
    },
    (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
    })
    ).build()

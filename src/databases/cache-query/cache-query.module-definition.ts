import { ConfigurableModuleBuilder } from "@nestjs/common"
import { CacheQueryOptions } from "./cache-query.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<CacheQueryOptions>()
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

import { ConfigurableModuleBuilder } from "@nestjs/common"
import { PostgreSQLCacheKeyOptions } from "./cache-key.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<PostgreSQLCacheKeyOptions>()
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

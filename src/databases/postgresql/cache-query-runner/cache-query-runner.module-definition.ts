import { ConfigurableModuleBuilder } from "@nestjs/common"
import { PostgreSQLCacheQueryRunnerOptions } from "./cache-query-runner.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<PostgreSQLCacheQueryRunnerOptions>()
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

import { ConfigurableModuleBuilder } from "@nestjs/common"
import { PostgreSQLOptionsOptions } from "./options.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<PostgreSQLOptionsOptions>()
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

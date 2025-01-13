import { ConfigurableModuleBuilder } from "@nestjs/common"
import { AxiosOptionsOptions } from "./options.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<AxiosOptionsOptions>()
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

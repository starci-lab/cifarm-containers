import { ConfigurableModuleBuilder } from "@nestjs/common"
import { TxModuleOptions } from "./types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<TxModuleOptions>()
        .setExtras(
            {
                isGlobal: false
            },
            (definition, extras) => {
                return {
                    ...definition,
                    global: extras.isGlobal
                }
            }
        )
        .build()
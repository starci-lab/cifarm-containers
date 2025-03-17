// File: axios.module-definition.ts

import { ConfigurableModuleBuilder } from "@nestjs/common"
import { E2EAxiosOptions } from "./axios.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<E2EAxiosOptions>()
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

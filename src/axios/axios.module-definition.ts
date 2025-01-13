// File: axios.module-definition.ts

import { ConfigurableModuleBuilder } from "@nestjs/common"
import { AxiosOptions } from "./axios.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<AxiosOptions>()
        .build()
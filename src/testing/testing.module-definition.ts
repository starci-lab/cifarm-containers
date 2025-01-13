// File: axios.module-definition.ts

import { ConfigurableModuleBuilder } from "@nestjs/common"
import { TestingOptions } from "./testing.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<TestingOptions>()
        .build()
import { ConfigurableModuleBuilder } from "@nestjs/common"
import { ThrottlerOptions } from "./types"
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<ThrottlerOptions>().setClassMethodName("forRoot")
        .build()
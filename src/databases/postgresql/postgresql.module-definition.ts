import { ConfigurableModuleBuilder } from "@nestjs/common"
import { PostgreSQLOptions } from "./postgresql.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<PostgreSQLOptions>().setClassMethodName("forRoot")
        .build()

import { ConfigurableModuleBuilder } from "@nestjs/common"
import { MongooseOptions } from "./types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<MongooseOptions>().setClassMethodName("forRoot")
        .build()
import { ConfigurableModuleBuilder } from "@nestjs/common"
import { SubgraphOptions } from "./types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
        new ConfigurableModuleBuilder<SubgraphOptions>().setClassMethodName("forRoot").build()

import { ConfigurableModuleBuilder } from "@nestjs/common"
import { SeederOptions } from "./seeders.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<SeederOptions>().build()

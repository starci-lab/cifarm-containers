import { ConfigurableModuleBuilder } from "@nestjs/common"
import { ExecOptions } from "./exec.types"
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<ExecOptions>().build()

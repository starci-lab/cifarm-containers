import { ConfigurableModuleBuilder } from "@nestjs/common"
import { HealthCheckOptions } from "./health-check.types"
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<HealthCheckOptions>().setClassMethodName("forRoot").build()

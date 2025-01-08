import { ConfigurableModuleBuilder } from "@nestjs/common"
import { DebugRedisClusterOptions } from "./redis-cluster.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<DebugRedisClusterOptions>().build()

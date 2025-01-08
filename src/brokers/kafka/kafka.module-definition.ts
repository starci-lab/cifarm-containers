import { ConfigurableModuleBuilder } from "@nestjs/common"
import { KafkaOptions } from "./kafka.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<KafkaOptions>().setClassMethodName("forRoot").build()

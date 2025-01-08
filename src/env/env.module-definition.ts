import { ConfigurableModuleBuilder } from "@nestjs/common"
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder().setClassMethodName("forRoot").setExtras({
        isGlobal: true,
    }).build()

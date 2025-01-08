import { ConfigurableModuleBuilder } from "@nestjs/common"
import { GraphqlGatewayOptions } from "./gateway.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
        new ConfigurableModuleBuilder<GraphqlGatewayOptions>().setExtras({
            isGlobal: false
        },
        (definition, extras) => ({
            ...definition,
            global: extras.isGlobal,
        })
        ).setClassMethodName("forRoot").build()

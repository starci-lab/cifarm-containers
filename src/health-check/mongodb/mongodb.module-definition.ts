import { ConfigurableModuleBuilder } from "@nestjs/common"
import { MongoDbHealthOptions } from "./mongodb.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<MongoDbHealthOptions>()
        .setExtras(
            {
                isGlobal: false
            },
            (definition, extras) => {
                return {
                    ...definition,
                    global: extras.isGlobal
                }
            }
        )
        .build()

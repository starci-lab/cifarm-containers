import { ConfigurableModuleBuilder } from "@nestjs/common"
import { GameplayPostgreSQLOptions } from "./gameplay-postgresql.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<GameplayPostgreSQLOptions>().setClassMethodName("forRoot").build()

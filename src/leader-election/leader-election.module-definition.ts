import { ConfigurableModuleBuilder } from "@nestjs/common"
import { LeaderElectionOptions } from "./leader-election.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<LeaderElectionOptions>()
        .setClassMethodName("forRoot")
        .setExtras(
            {
                isGlobal: true
            },
            (definition, extras) => ({
                ...definition,
                global: extras.isGlobal
            })
        )
        .build()

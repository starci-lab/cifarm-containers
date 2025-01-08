import { ConfigurableModuleBuilder } from "@nestjs/common"
import { LeaderElectionOptions } from "./leader-election.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<LeaderElectionOptions>().setClassMethodName("forRoot").build()

import { Module } from "@nestjs/common"
import { RedisType } from "@src/env"
import { ExecModule } from "@src/exec"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./Subgraph-options.module-definition"
import { SubgraphOptionsFactory } from "./subgraph-options-factory"

@Module({
    imports: [
        ExecModule.register({
            docker: {
                redisCluster: {
                    type: RedisType.Job
                }
            }
        })
    ],
    providers: [SubgraphOptionsFactory],
    exports: [SubgraphOptionsFactory]
})
export class SubgraphOptionsModule extends ConfigurableModuleClass {
    static forRoot(options: typeof OPTIONS_TYPE = {}) {
        return super.forRoot(options)
    }
}

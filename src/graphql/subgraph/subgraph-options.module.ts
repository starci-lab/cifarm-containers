import { Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./Subgraph-options.module-definition"
import { SubgraphOptionsFactory } from "./subgraph-options-factory"
import { KeyvModule } from "@src/cache"

@Module({
    imports: [
        KeyvModule.register()
    ],
    providers: [SubgraphOptionsFactory],
    exports: [SubgraphOptionsFactory]
})
export class SubgraphOptionsModule extends ConfigurableModuleClass {
    static forRoot(options: typeof OPTIONS_TYPE = {}) {
        return super.forRoot(options)
    }
}

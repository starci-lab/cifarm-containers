import { Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./options.module-definition"
import { SubgraphOptionsFactory } from "./options.factory"
import { KeyvModule } from "@src/cache"

@Module({
    imports: [
        KeyvModule.register()
    ],
    providers: [SubgraphOptionsFactory],
    exports: [SubgraphOptionsFactory]
})
export class SubgraphOptionsModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}

import { DynamicModule, Module } from "@nestjs/common"
import { NearAccountsService } from "./near-accounts"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./special.module-definition"

@Module({
    providers: [NearAccountsService],
    exports: [NearAccountsService],
})
export class SpecialModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) : DynamicModule {
        return super.register(options)
    }
}
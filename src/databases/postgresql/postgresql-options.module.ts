import { Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./postgresql-options.module-definition"
import { PostgreSQLOptionsFactory } from "./postgresql-options.factory"
import { CacheOptionsModule } from "../cache-options"

@Module({
    imports: [
        CacheOptionsModule.register()
    ],
    providers: [
        PostgreSQLOptionsFactory
    ],
    exports: [
        PostgreSQLOptionsFactory
    ]
})
export class PostgreSQLOptionsModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}

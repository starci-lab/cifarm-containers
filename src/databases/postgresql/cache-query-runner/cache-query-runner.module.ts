import { Module } from "@nestjs/common"
import { CryptoModule } from "@src/crypto"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache-query-runner.module-definition"
import { PostgreSQLCacheQueryRunnerService } from "./cache-query-runner.service"

@Module({
    imports: [CryptoModule.register()],
    providers: [PostgreSQLCacheQueryRunnerService],
    exports: [PostgreSQLCacheQueryRunnerService]
})
export class PostgreSQLCacheQueryRunnerModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}

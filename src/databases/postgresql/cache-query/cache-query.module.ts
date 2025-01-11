import { Module } from "@nestjs/common"
import { CryptoModule } from "@src/crypto"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache-query.module-definition"
import { PostgreSQLCacheQueryRunnerService } from "./cache-query-runner.service"
import { PostgreSQLCacheQueryService } from "./cache-query.service"

@Module({
    imports: [CryptoModule.register()],
    providers: [PostgreSQLCacheQueryService, PostgreSQLCacheQueryRunnerService],
    exports: [PostgreSQLCacheQueryRunnerService]
})
export class PostgreSQLCacheQueryModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}

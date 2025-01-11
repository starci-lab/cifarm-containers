import { Module } from "@nestjs/common"
import { CryptoModule } from "@src/crypto"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache-query.module-definition"
import { CacheQueryRunnerService } from "./cache-query-runner.service"
import { CacheQueryService } from "./cache-query.service"

@Module({
    imports: [CryptoModule.register()],
    providers: [CacheQueryService, CacheQueryRunnerService],
    exports: [CacheQueryRunnerService]
})
export class CacheQueryModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}

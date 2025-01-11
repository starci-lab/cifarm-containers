import { Module } from "@nestjs/common"
import { CryptoModule } from "@src/crypto"
import { PostgreSQLCacheKeyService } from "./cache-key.service"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache-key.module-definition"

@Module({
    imports: [CryptoModule.register()],
    providers: [PostgreSQLCacheKeyService],
    exports: [PostgreSQLCacheKeyService]
})
export class PostgreSQLCacheKeyModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}

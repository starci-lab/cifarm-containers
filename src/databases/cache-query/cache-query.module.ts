import { Module } from "@nestjs/common"
import { CryptoModule } from "@src/crypto"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache-query.module-definition"
import { CacheQueryRunnerService } from "./cache-query-runner.service"
import { CacheQueryService } from "./cache-query.service"
import { IoRedisModule } from "@src/native"
import { RedisType } from "@src/env"

@Module({
    imports: [CryptoModule.register(), IoRedisModule.register({
        type: RedisType.Cache
    })],
    providers: [CacheQueryService, CacheQueryRunnerService],
    exports: [CacheQueryService, CacheQueryRunnerService]
})
export class CacheQueryModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}

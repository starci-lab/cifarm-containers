import { Module, Provider } from "@nestjs/common"
import { ExecModule } from "@src/exec"
import { OPTIONS_TYPE, ConfigurableModuleClass } from "./ioredis.module-definition"
import { RedisType } from "@src/env"
import { createIoRedisFactoryProvider } from "./ioredis.providers"
import { IoRedisFactory } from "./ioredis.factory"

@Module({})
export class IoRedisModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}) {
        const type = options.type ?? RedisType.Cache
        const dynamicModule = super.register(options)

        const providers: Array<Provider> = [IoRedisFactory]
        const exports: Array<Provider> = [IoRedisFactory]

        const ioRedisFactoryProvider = createIoRedisFactoryProvider()

        providers.push(ioRedisFactoryProvider)
        exports.push(ioRedisFactoryProvider)

        return {
            ...dynamicModule,
            imports: [
                ExecModule.register({
                    docker: {
                        redisCluster: {
                            type
                        }
                    }
                })
            ],
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}

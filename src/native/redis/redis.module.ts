import { Module, Provider } from "@nestjs/common"
import { ExecModule } from "@src/exec"
import { OPTIONS_TYPE, ConfigurableModuleClass } from "./redis.module-definition"
import { RedisType } from "@src/env"
import { createRedisFactoryProvider } from "./redis.providers"

@Module({})
export class RedisModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}) {
        const type = options.type ?? RedisType.Cache
        const dynamicModule = super.register(options)

        const providers: Array<Provider> = []
        const exports: Array<Provider> = []

        const redisFactoryProvider = createRedisFactoryProvider()

        providers.push(redisFactoryProvider)
        exports.push(redisFactoryProvider)

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

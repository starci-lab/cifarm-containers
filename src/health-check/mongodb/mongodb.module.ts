import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./mongodb.module-definition"
import { NestProvider } from "@src/common"
import { MongoDbModule } from "@src/native"
import { MongoDatabase } from "@src/env"
import { MongoDbHealthIndicator } from "./mongodb.indicator"

@Module({})
export class MongodbHealthModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        const database = options.database || MongoDatabase.Adapter
        const module = MongoDbModule.register({
            database,
        })

        const providers: Array<NestProvider> = []
        const exports: Array<NestProvider> = []
        
        if (options.injectionToken) {
            const provider: Provider = {
                provide: options.injectionToken,
                useClass: MongoDbHealthIndicator,
            }
            providers.push(provider)
            exports.push(provider)
        }

        return {
            ...dynamicModule,
            imports: [module],
            providers: [...dynamicModule.providers, ...providers],
            exports,
        }
    }
}
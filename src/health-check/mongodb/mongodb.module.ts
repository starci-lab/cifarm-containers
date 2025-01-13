import { DynamicModule, Module } from "@nestjs/common"
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

        const providers: Array<NestProvider> = [
            MongoDbHealthIndicator,
        ]
        if (options.injectionToken) {
            providers.push({
                provide: options.injectionToken,
                useExisting: MongoDbHealthIndicator,
            })
        }
        const exports: Array<NestProvider> = [
            MongoDbHealthIndicator,
        ]

        return {
            ...dynamicModule,
            imports: [module],
            providers: [...dynamicModule.providers, ...providers],
            exports,
        }
    }
}
import { Module, Provider } from "@nestjs/common"
import { OPTIONS_TYPE, ConfigurableModuleClass } from "./mongodb.module-definition"
import { createMongoDbFactoryProvider } from "./mongodb.providers"

@Module({})
export class MongoDbModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}) {
        const dynamicModule = super.register(options)

        const providers: Array<Provider> = []
        const exports: Array<Provider> = []

        const mongoDbFactoryProvider = createMongoDbFactoryProvider()

        providers.push(mongoDbFactoryProvider)
        exports.push(mongoDbFactoryProvider)

        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}

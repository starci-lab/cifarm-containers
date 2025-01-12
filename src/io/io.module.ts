import { DynamicModule, Module, Provider } from "@nestjs/common"
import { RedisIoAdapter } from "./redis-io.adapter"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./io.module-definition"
import { MongoDatabase, RedisType } from "@src/env"
import { MongoDbModule, RedisModule } from "@src/native"
import { IoAdapterType } from "./io.types"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { MongoIoAdapter } from "./mongo-io.adapter"
import { IO_ADAPTER } from "./io.constants"

@Module({
    imports: [
        RedisModule.register({
            type: RedisType.Adapter
        }),
        MongoDbModule.register({
            database: MongoDatabase.Adapter
        })
    ],
    providers: [RedisIoAdapter],
    exports: [RedisIoAdapter]
})
export class IoModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) : DynamicModule {
        const adapter = options.adapter || IoAdapterType.MongoDb

        // define the modules, providers, and exports arrays
        const imports: Array<NestImport> = []
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        // Use switch case for cleaner handling of different adapters
        switch (adapter) {
        case IoAdapterType.Redis: {
            imports.push(
                RedisModule.register({
                    type: RedisType.Adapter
                })
            )
            // define the provider for the RedisIoAdapter
            const provider: Provider = {
                provide: IO_ADAPTER,
                useClass: RedisIoAdapter
            }

            providers.push(provider)
            exports.push(provider)
            break
        }
        case IoAdapterType.MongoDb: {
            imports.push(
                MongoDbModule.register({
                    database: MongoDatabase.Adapter
                })
            )
            // define the provider for the MongoIoAdapter
            const provider: Provider = {
                provide: IO_ADAPTER,
                useClass: MongoIoAdapter
            }
            providers.push(provider)
            exports.push(provider)
            break
        }
        }

        const dynamicModule = super.register(options)

        return {
            ...dynamicModule,
            imports,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}

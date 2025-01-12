import { DynamicModule, Module } from "@nestjs/common"
import { RedisIoAdapter } from "./redis-io.adapter"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./io.module-definition"
import { MongoDatabase, RedisType } from "@src/env"
import { MongoDbModule, RedisModule } from "@src/native"
import { IoAdapterType } from "./io.types"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { MongoIoAdapter } from "./mongo-io.adapter"

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
            providers.push(RedisIoAdapter)
            exports.push(RedisIoAdapter)
            break
        }
        case IoAdapterType.MongoDb: {
            imports.push(
                MongoDbModule.register({
                    database: MongoDatabase.Adapter
                })
            )
            providers.push(MongoIoAdapter)
            exports.push(MongoIoAdapter)
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

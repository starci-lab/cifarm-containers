import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./io.module-definition"
import { IoAdapterType, MongoDatabase, RedisType } from "@src/env"
import { MongoDbModule, RedisModule } from "@src/native"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { IO_ADAPTER_FACTORY } from "./io.constants"
import { ClusterIoAdapterFactory, MongoDbIoAdapterFactory, RedisIoAdapterFactory } from "./adapters"
import { SocketCoreService } from "./socket-base.service"
import { CacheModule } from "@src/cache"
import { JwtModule } from "@src/jwt"

@Module({})
export class IoModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const adapter = options.adapter || IoAdapterType.MongoDb
        const useGlobalImports = options.useGlobalImports || false
        // define the modules, providers, and exports arrays
        const imports: Array<NestImport> = []
        
        //check if the global module is used
        if (!useGlobalImports) {
            imports.push(CacheModule.register())
            imports.push(JwtModule.register())
        }

        const providers: Array<NestProvider> = [SocketCoreService]
        const exports: Array<NestExport> = [SocketCoreService]

        // Use switch case for cleaner handling of different adapters
        switch (adapter) {
        case IoAdapterType.Redis: {
            imports.push(
                RedisModule.register({
                    type: RedisType.Adapter
                })
            )
            const provider: Provider = {
                provide: IO_ADAPTER_FACTORY,
                useClass: RedisIoAdapterFactory
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
            const provider: Provider = {
                provide: IO_ADAPTER_FACTORY,
                useClass: MongoDbIoAdapterFactory
            }
            // define the provider for the MongoIoAdapter
            providers.push(provider)
            exports.push(provider)
            break
        }
        case IoAdapterType.Cluster: {
            const provider: Provider = {
                provide: IO_ADAPTER_FACTORY,
                useClass: ClusterIoAdapterFactory
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

import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./blockchain-database.module-definition"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { NFTDatabaseService } from "./nft-database"

@Module({})
export class BlockchainDatabaseModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)

        const imports: Array<NestImport> = []
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        const services = [
            NFTDatabaseService
        ]
        providers.push(...services)
        exports.push(...services)
        return {
            ...dynamicModule,
            imports,
            providers,
            exports
        }
    }
}
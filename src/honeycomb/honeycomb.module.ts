import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./honeycomb.module-definition"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { BlockchainModule } from "@src/blockchain"
import { HoneycombService } from "./honeycomb.service"

@Module({})
export class HoneycombModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE): DynamicModule {
        const dynamicModule = super.register(options)

        const imports: Array<NestImport> = []
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        if (!options.useGlobalImports) {
            imports.push(BlockchainModule.register())
        }

        providers.push(HoneycombService)
        exports.push(HoneycombService)

        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            imports,
            exports
        }
    }
}

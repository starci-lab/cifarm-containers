import { DynamicModule, Module } from "@nestjs/common"
import { SolanaMetaplexService } from "./solana"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./nft.module-definition"
import { NestImport, NestProvider } from "@src/common"
import { S3Module } from "@src/s3"

@Module({})
export class NFTModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {   
        const dynamicModule = super.register(options)
        const isGlobal = options.isGlobal

        const imports: Array<NestImport> = []
        const providers: Array<NestProvider> = []
        const exports:  Array<NestProvider> = []
        
        if (!options.useGlobalImports) {
            imports.push(S3Module.register())
        }

        providers.push(SolanaMetaplexService)
        exports.push(SolanaMetaplexService)
        return {
            ...dynamicModule,
            global: isGlobal,
            providers,
            exports,
            imports
        }
    }
}

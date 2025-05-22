import { DynamicModule, Module } from "@nestjs/common"
import { SolanaService } from "./solana"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./tx.module-definition"
import { NestImport, NestProvider } from "@src/common"
import { S3Module } from "@src/s3"
import { SuiService } from "./sui"

@Module({})
export class TxModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {   
        const dynamicModule = super.register(options)
        const isGlobal = options.isGlobal

        const imports: Array<NestImport> = []
        const providers: Array<NestProvider> = []
        const exports:  Array<NestProvider> = []
        
        if (!options.useGlobalImports) {
            imports.push(S3Module.register())
        }

        const services = [
            SolanaService,
            SuiService
        ]
        providers.push(...services)
        exports.push(...services)
        return {
            ...dynamicModule,
            global: isGlobal,
            providers,
            exports,
            imports
        }
    }
}

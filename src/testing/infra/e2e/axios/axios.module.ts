// File: axios.module.ts

import { DynamicModule, Module } from "@nestjs/common"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./axios.module-definition"
import { CacheModule, CacheType } from "@src/cache"
import { E2EAxiosService } from "./axios.service"
import { E2ERAuthenticationService } from "./authentication.service"
import { MongooseModule } from "@src/databases"

@Module({})
export class E2EAxiosModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)

        const imports: Array<NestImport> = []
        const services = [E2EAxiosService, E2ERAuthenticationService]
        const providers: Array<NestProvider> = [...services]
        const exports: Array<NestExport> = [...services]

        if (!options.useGlobalImports) {
            imports.push(
                CacheModule.register({
                    cacheType: CacheType.Memory
                }),
                MongooseModule.forRoot()
            )
        }

        return {
            ...dynamicModule,
            imports,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}

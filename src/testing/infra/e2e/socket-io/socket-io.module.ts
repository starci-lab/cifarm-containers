import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./socket-io.module-definition"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { E2EGameplaySocketIoService } from "./gameplay-socket-io.service"

@Module({})
export class E2ESocketIoModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)

        const imports: Array<NestImport> = []
        const providers: Array<NestProvider> = [E2EGameplaySocketIoService]
        const exports: Array<NestExport> = [E2EGameplaySocketIoService]

        return {
            ...dynamicModule,
            imports,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}

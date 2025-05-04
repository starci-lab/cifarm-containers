import { DynamicModule, Module } from "@nestjs/common"
import { S3Service } from "./s3.service"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./s3.module-definition"
import { NestProvider } from "@src/common"

@Module({})
export class S3Module extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        const isGlobal = options.isGlobal
        const providers: Array<NestProvider> = []
        const exports: Array<NestProvider> = []
        providers.push(S3Service)
        exports.push(S3Service)
        return {
            ...dynamicModule,
            global: isGlobal,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
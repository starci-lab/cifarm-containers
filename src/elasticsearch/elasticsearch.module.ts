import { DynamicModule, Module } from "@nestjs/common"
import { ElasticsearchModule as NestElasticsearchModule } from "@nestjs/elasticsearch"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./elasticsearch.module-definition"
import { NestImport, NestExport } from "@src/common"
import { envConfig } from "@src/env"

@Module({})
export class ElasticsearchModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        const module = NestElasticsearchModule.register(
            {
                node: envConfig().elasticsearch.url,
                auth: {
                    username: envConfig().elasticsearch.username,
                    password: envConfig().elasticsearch.password,
                }
            }
        )
        const imports: Array<NestImport> = [module]
        const exports: Array<NestExport> = [module]
        return {
            ...dynamicModule,
            imports,
            exports
        }
    }
}
import { DynamicModule, Module } from "@nestjs/common"
import { ElasticsearchModule as NestElasticsearchModule } from "@nestjs/elasticsearch"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./elasticsearch.module-definition"
import { NestImport, NestExport } from "@src/common"

@Module({})
export class ElasticsearchModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        const module = NestElasticsearchModule.register(
            {
                node: "http://localhost:9200",
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
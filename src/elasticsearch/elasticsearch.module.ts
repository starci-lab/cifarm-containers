import { DynamicModule, Logger, Module } from "@nestjs/common"
import { ElasticsearchModule as NestElasticsearchModule } from "@nestjs/elasticsearch"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./elasticsearch.module-definition"
import { NestImport, NestExport } from "@src/common"
import { envConfig, runInKubernetes } from "@src/env"
import { readFileSync } from "fs"

@Module({})
export class ElasticsearchModule extends ConfigurableModuleClass {
    private static readonly logger = new Logger(ElasticsearchModule.name)

    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const inKubernetes = runInKubernetes()
        const dynamicModule = super.register(options)
        let module: DynamicModule

        this.logger.log(`Running in Kubernetes: ${inKubernetes}`)
        this.logger.log(`Require TLS: ${envConfig().elasticsearch.requireTLS}`)

        if (inKubernetes && envConfig().elasticsearch.requireTLS) {
            const ca = readFileSync("/etc/elasticsearch/certs/ca.crt", "utf-8")
            this.logger.log(`Loaded CA certificate: length=${ca.length}`)

            module = NestElasticsearchModule.registerAsync({
                useFactory: async () => ({
                    node: envConfig().elasticsearch.url,
                    auth: {
                        username: envConfig().elasticsearch.username,
                        password: envConfig().elasticsearch.password,
                    },
                    tls: {
                        ca,
                        rejectUnauthorized: true,
                    },
                }),
            })
        } else {
            module = NestElasticsearchModule.registerAsync({
                useFactory: async () => ({
                    node: envConfig().elasticsearch.url,
                }),
            })
        }

        const imports: Array<NestImport> = [module]
        const exports: Array<NestExport> = [module]

        return {
            ...dynamicModule,
            imports,
            exports,
        }
    }
}

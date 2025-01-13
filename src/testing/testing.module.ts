// File: axios.module.ts

import { DynamicModule, Module } from "@nestjs/common"
import { AxiosType, getAxiosToken } from "@src/axios"
import { AxiosOptionsModule } from "@src/axios/options"
import { PostgreSQLModule } from "@src/databases"
import { EnvModule } from "@src/env"
import { MOCK_DATABASE_OPTIONS } from "./testing.constants"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./testing.module-definition"

@Module({})
export class TestingModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule =  super.register(options)

        const imports: Array<DynamicModule> = []
        const exports: Array<DynamicModule> = []

        imports.push(
            EnvModule.forRoot(),
            PostgreSQLModule.forRoot(MOCK_DATABASE_OPTIONS),
            AxiosOptionsModule.register({
                injectionToken: getAxiosToken({
                    type: AxiosType.AxiosWithNoAuth
                }),
                options: {
                    type: AxiosType.AxiosWithNoAuth
                }
            }),
            AxiosOptionsModule.register({
                injectionToken: getAxiosToken({
                    type: AxiosType.AxiosWithAuth
                }),
                options: {
                    type: AxiosType.AxiosWithAuth
                }
            }),
        )
        return {
            ...dynamicModule,
            imports: [
                ...dynamicModule.imports,
                ...imports
            ],
            exports
        }
    }
}

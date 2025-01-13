// File: axios.module.ts

import { HttpModule } from "@nestjs/axios"
import { DynamicModule, Module } from "@nestjs/common"
import { DEFAULT_BASE_URL } from "./axios.constants"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./axios.module-definition"
import { ApiVersion } from "./axios.types"
import { AxiosOptionsFactory } from "./options"

@Module({})
export class AxiosModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)

        options.apiVersion = options.apiVersion || ApiVersion.V1
        options.baseUrl = options.baseUrl || DEFAULT_BASE_URL

        return {
            ...dynamicModule,
            imports: [HttpModule.registerAsync({
                inject: [AxiosOptionsFactory],
                useFactory: (axiosOptionsFactory: AxiosOptionsFactory) =>
                    axiosOptionsFactory.createHttpOptions()
            })]
        }
    }
}

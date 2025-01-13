// File: axios.module.ts

import { HttpModule } from "@nestjs/axios"
import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./axios.module-definition"
import { AxiosOptionsFactory, AxiosOptionsModule } from "./options"
import { AxiosType } from "./axios.constants"

@Module({})
export class AxiosModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        options.type = options.type || AxiosType.AxiosWithNoAuth

        const dynamicModule = super.register(options)
        
        return {
            ...dynamicModule,
            imports: [HttpModule.registerAsync({
                imports: [
                    AxiosOptionsModule.register({
                        options
                    })
                ],
                inject: [AxiosOptionsFactory],
                useFactory: (axiosOptionsFactory: AxiosOptionsFactory) =>
                    axiosOptionsFactory.createHttpOptions()
            })]
        }
    }
}

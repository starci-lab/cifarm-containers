import { DynamicModule, Module, Provider } from "@nestjs/common"
import { NestExport, NestProvider } from "@src/common"
import { AXIOS_INSTANCE_TOKEN, axiosMap } from "../axios.constants"
import { createAxiosInstance } from "../axios.utils"
import { AxiosOptionsFactory } from "./options.factory"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./options.module-definition"

@Module({
})
export class AxiosOptionsModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)

        const providers: Array<NestProvider> = [AxiosOptionsFactory]
        const exports: Array<NestExport> = [AxiosOptionsFactory]

        if (options.injectionToken) {
            const axiosConfig = axiosMap[options.options.type]

            const provider: Provider = {
                provide: options.injectionToken,
                useValue: createAxiosInstance(axiosConfig.config),
            }
            providers.push(provider)
            exports.push(provider)
        }

        console.log("PROVIDER", providers)

        return {
            ...dynamicModule,
            imports: [],
            providers: [...dynamicModule.providers, ...providers,
                {
                    provide: AXIOS_INSTANCE_TOKEN,
                    useValue: createAxiosInstance(),
                }
            ],
            exports
        }
    }
}

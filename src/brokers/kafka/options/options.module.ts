import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./options.module-definition"
import { KafkaOptionsFactory } from "./options.factory"

@Module({
    providers: [ KafkaOptionsFactory ],
    exports: [ KafkaOptionsFactory ],
})
export class KafkaOptionsModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        return super.register(options)
    }
}

import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./options.module-definition"
import { KafkaOptionsFactory } from "./options.factory"
import { FileSystemModule } from "@src/file-system"
@Module({
    imports: [ FileSystemModule.register() ],
    providers: [ KafkaOptionsFactory ],
    exports: [ KafkaOptionsFactory ],
})
export class KafkaOptionsModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        return super.register(options)
    }
}

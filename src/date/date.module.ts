import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./date.module-definition"
import { DateUtcService } from "./utc.service"

@Module({
    providers: [DateUtcService],
    exports: [DateUtcService]
})
export class DateModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        return super.register(options)
    }
}

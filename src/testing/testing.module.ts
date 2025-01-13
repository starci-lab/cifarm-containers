import { Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./Testing.module-definition"

@Module({})
export class TestingModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}

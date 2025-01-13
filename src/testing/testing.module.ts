// File: axios.module.ts

import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./testing.module-definition"

@Module({})
export class TestingModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        return super.register(options)
    }
}

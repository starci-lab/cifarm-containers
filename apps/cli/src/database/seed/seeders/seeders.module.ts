import { Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./seeders.module-definition"
import { SeedersService } from "./seeders.service"

@Module({
    providers: [ SeedersService ],
    exports: [ SeedersService ],
})
export class SeedersModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}
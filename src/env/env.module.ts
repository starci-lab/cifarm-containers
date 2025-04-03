import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "./env.config"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./env.module-definition"

@Module({})
export class EnvModule extends ConfigurableModuleClass {
    static forRoot(options: typeof OPTIONS_TYPE = {}) {
        const dynamicModule = super.forRoot(options)
        return {
            ...dynamicModule,
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    load: [envConfig],
                    envFilePath: [".env.local", ".env.secret"]
                })
            ]
        }
    }
}

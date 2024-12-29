import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "./env.config"

@Module({})
export class EnvModule {
    public static forRoot() {
        return {
            module: EnvModule,
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    load: [envConfig],
                    envFilePath: [".env.local"],
                })
            ],
            providers: [],
            exports: []
        }
    }
}
import { DynamicModule } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"

export const configForRoot = () : Promise<DynamicModule> => {
    return ConfigModule.forRoot({
        load: [envConfig],
        envFilePath: [".env.local"],
        isGlobal: true
    })
}
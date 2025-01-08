import { DynamicModule, Module } from "@nestjs/common"
import { BcryptService } from "./bcrypt.service"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./crypto.module-definition"
import { Sha256Service } from "./sha256.service"

@Module({
    providers: [BcryptService, Sha256Service],
    exports: [BcryptService, Sha256Service]
})
export class CryptoModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        return super.register(options)
    }
}

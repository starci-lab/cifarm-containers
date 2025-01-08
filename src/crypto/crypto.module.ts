import { DynamicModule, Module } from "@nestjs/common"
import { BcryptService } from "./bcrypt.service"
import { Sha256Service } from "./sha256.service"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./crypto.module-definition"

@Module({
    imports: [],
    providers: [ BcryptService, Sha256Service ],
    exports: [ BcryptService, Sha256Service ]
})
export class CryptoModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule{
        return super.register(options)
    }
}
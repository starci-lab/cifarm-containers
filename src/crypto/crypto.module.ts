import { DynamicModule, Module } from "@nestjs/common"
import { BcryptService } from "./bcrypt.service"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./crypto.module-definition"
import { Sha256Service } from "./sha256.service"
import { CipherService } from "./cipher.service"
import { SerializationService } from "./serialization.service"
@Module({})
export class CryptoModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        const services = [
            BcryptService,
            SerializationService,
            Sha256Service,
            CipherService
        ]

        return {
            ...dynamicModule,
            providers: [
                ...dynamicModule.providers, ...services
            ],
            exports: [
                ...services
            ]
        }

    }
}

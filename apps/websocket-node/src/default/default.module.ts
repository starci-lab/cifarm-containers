import { Module } from "@nestjs/common"
import { DefaultGateway } from "./default.gateway"
import { CryptoModule } from "@src/crypto"
import { EnvModule } from "@src/env"

@Module({
    imports: [
        EnvModule.forRoot(),
        CryptoModule,
    ],
    controllers: [],
    providers: [DefaultGateway]
})
export class DefaultModule { }

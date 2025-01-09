import { Module } from "@nestjs/common"
import { CryptoModule } from "@src/crypto"
import { DefaultGateway } from "./default.gateway"

@Module({
    imports: [
        CryptoModule,
    ],
    controllers: [],
    providers: [DefaultGateway]
})
export class DefaultModule { }

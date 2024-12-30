import { Module } from "@nestjs/common"
import { DefaultGateway } from "./default.gateway"
import { BcryptModule } from "@src/crypto/bcrypt"
import { EnvModule } from "@src/env"

@Module({
    imports: [
        EnvModule.forRoot(),
        BcryptModule,
    ],
    controllers: [],
    providers: [DefaultGateway]
})
export class DefaultModule { }

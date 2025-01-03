import { Module } from "@nestjs/common"
import { BcryptService } from "./bcrypt.service"
import { Sha256Service } from "./sha256.service"

@Module({
    imports: [],
    providers: [ BcryptService, Sha256Service ],
    exports: [ BcryptService, Sha256Service ]
})
export class CryptoModule {}
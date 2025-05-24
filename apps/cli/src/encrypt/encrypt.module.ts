import { Module } from "@nestjs/common"
import { EncryptToBase64Module } from "./encrypt-to-base64"
import { EncryptCommand } from "./encrypt.command"
import { DecryptFromBase64Module } from "./decrypt-from-base64"
@Module({
    imports: [
        EncryptToBase64Module,
        DecryptFromBase64Module
    ],
    providers: [
        EncryptCommand
    ]
})
export class EncryptModule {}
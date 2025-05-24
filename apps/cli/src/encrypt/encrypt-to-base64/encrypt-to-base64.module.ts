import { Module } from "@nestjs/common"
import { EncryptToBase64Command } from "./encrypt-to-base64.command"

@Module({
    providers: [ EncryptToBase64Command ],
})
export class EncryptToBase64Module {}
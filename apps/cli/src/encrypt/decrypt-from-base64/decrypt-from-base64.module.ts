import { Module } from "@nestjs/common"
import { DecryptFromBase64Command } from "./decrypt-from-base64.command"

@Module({
    providers: [ DecryptFromBase64Command ],
})
export class DecryptFromBase64Module {}
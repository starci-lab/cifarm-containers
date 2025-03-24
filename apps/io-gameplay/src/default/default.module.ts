import { Module } from "@nestjs/common"
import { DefaultGateway } from "./default.gateway"

@Module({
    providers: [DefaultGateway]
})
export class DefaultNamespaceModule { }

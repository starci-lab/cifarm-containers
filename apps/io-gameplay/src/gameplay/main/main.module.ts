import { Module } from "@nestjs/common"
import { MainGateway } from "./main.gateway"

@Module({
    providers: [MainGateway],
    exports: [MainGateway]
})
export class MainModule {}
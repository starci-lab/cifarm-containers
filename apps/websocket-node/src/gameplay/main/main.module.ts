import { Module } from "@nestjs/common"
import { MainGateway } from "./main.gateway"

@Module({
    providers: [MainGateway]
})
export class MainModule {}
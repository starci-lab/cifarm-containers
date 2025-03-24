import { Module } from "@nestjs/common"
import { ReturnGateway } from "./return.gateway"

@Module({
    providers: [ReturnGateway],
})
export class ReturnModule {}
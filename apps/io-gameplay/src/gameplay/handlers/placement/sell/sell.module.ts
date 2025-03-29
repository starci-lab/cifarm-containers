import { Module } from "@nestjs/common"
import { SellService } from "./sell.service"
import { SellGateway } from "./sell.gateway"

@Module({
    providers: [SellService, SellGateway],
})
export class SellModule {}

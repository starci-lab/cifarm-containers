import { Module } from "@nestjs/common"
import { SellService } from "./sell.service"
import { SellResolver } from "./sell.resolver"

@Module({
    providers: [SellService, SellResolver],
})
export class SellModule {}

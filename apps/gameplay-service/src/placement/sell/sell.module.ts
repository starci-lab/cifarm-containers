import { Module } from "@nestjs/common"
import { SellController } from "./sell.controller"
import { SellService } from "./sell.service"

@Module({
    imports: [],
    providers: [SellService],
    controllers: [SellController]
})
export class SellModule {}

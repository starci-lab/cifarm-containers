import { Global, Module } from "@nestjs/common"
import { BalanceModule } from "../balance"
import { GoldController } from "./gold.controller"
import { GoldService } from "./gold.service"

@Global()
@Module({
    controllers: [GoldController],
    providers: [GoldService, BalanceModule],
    exports: [GoldService]
})
export class GoldModule {}

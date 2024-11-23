import { Global, Module } from "@nestjs/common"
import { BalanceModule } from "../balance"
import { GoldBalanceService } from "./gold.service"

@Global()
@Module({
    providers: [GoldBalanceService, BalanceModule],
    exports: [GoldBalanceService]
})
export class GoldBalanceModule {}

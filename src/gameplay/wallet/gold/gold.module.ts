import { Global, Module } from "@nestjs/common"
import { GoldBalanceService } from "./gold.service"

@Global()
@Module({
    providers: [GoldBalanceService],
    exports: [GoldBalanceService]
})
export class GoldBalanceModule {}

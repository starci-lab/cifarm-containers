import { Global, Module } from "@nestjs/common"
import { BalanceService } from "./balance.service"

@Global()
@Module({
    imports: [],
    providers: [BalanceService],
    exports: [BalanceService]
})
export class BalanceModule {}

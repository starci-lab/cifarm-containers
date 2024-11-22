import { Global, Module } from "@nestjs/common"
import { TokenBalanceService } from "./token.service"
import { BalanceService } from "../balance"

@Global()
@Module({
    providers: [TokenBalanceService, BalanceService],
    exports: [TokenBalanceService]
})
export class TokenBalanceModule {}

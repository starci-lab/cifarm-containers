import { Global, Module } from "@nestjs/common"
import { TokenBalanceService } from "./token.service"

@Global()
@Module({
    providers: [TokenBalanceService],
    exports: [TokenBalanceService]
})
export class TokenBalanceModule {}

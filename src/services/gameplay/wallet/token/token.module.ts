import { Global, Module } from "@nestjs/common"
import { TokenService } from "./token.service"
import { BalanceService } from "../balance"

@Global()
@Module({
    providers: [TokenService, BalanceService],
    exports: [TokenService]
})
export class TokenModule {}

import { Global, Module } from "@nestjs/common"
import { TokenController } from "./token.controller"
import { TokenService } from "./token.service"
import { BalanceService } from "../balance"

@Global()
@Module({
    controllers: [TokenController],
    providers: [TokenService, BalanceService],
    exports: [TokenService]
})
export class TokenModule {}

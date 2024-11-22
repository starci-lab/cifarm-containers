import { Global, Module } from "@nestjs/common"
import { BalanceModule } from "../balance"
import { GoldTokenService } from "./gold.service"

@Global()
@Module({
    providers: [GoldTokenService, BalanceModule],
    exports: [GoldTokenService]
})
export class GoldTokenModule {}

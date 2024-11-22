import { Global, Module } from "@nestjs/common"
import { BalanceModule } from "../balance"
import { GoldService } from "./gold.service"

@Global()
@Module({
    providers: [GoldService, BalanceModule],
    exports: [GoldService]
})
export class GoldModule {}

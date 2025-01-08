import { Module } from "@nestjs/common"
import { NearAccountsService } from "./near-accounts"

@Module({
    providers: [NearAccountsService],
    exports: [NearAccountsService],
})
export class SpecialModule {}
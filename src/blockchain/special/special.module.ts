import { Module } from "@nestjs/common"
import { NearAccountsService } from "./near-accounts"

@Module({
    imports: [],
    providers: [NearAccountsService],
    exports: [NearAccountsService],
})
export class SpecialModule {}

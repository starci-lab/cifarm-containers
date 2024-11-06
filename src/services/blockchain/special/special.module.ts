import { Global, Module } from "@nestjs/common"
import { NearAccountsService } from "./near-accounts"

@Global()
@Module({
    imports: [],
    providers: [NearAccountsService],
    exports: [NearAccountsService],
})
export class SpecialModule {}

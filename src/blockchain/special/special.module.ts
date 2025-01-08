import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "../blockchain.module-definition"
import { NearAccountsService } from "./near-accounts"

@Module({
    providers: [NearAccountsService],
    exports: [NearAccountsService],
})
export class SpecialModule extends ConfigurableModuleClass {}
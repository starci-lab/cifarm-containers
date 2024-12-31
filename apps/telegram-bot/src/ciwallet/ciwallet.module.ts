import { Module } from "@nestjs/common"
import { EnvModule } from "@src/env"
import { CiWalletService } from "./ciwallet.service"

@Module({})
export class CiWalletModule {
    public static forRoot() {
        return {
            module: CiWalletModule,
            imports: [EnvModule.forRoot()],
            providers: [CiWalletService],
            exports: [],
        }
    }
}

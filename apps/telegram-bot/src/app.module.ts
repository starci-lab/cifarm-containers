import { Module } from "@nestjs/common"
import { CiWalletModule } from "./ciwallet"

@Module({
    imports: [
    // CiFarmModule.forRoot(),
        CiWalletModule.forRoot()
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}

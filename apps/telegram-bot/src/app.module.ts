import { Module } from "@nestjs/common"
// import { CiWalletModule } from "./ciwallet"
import { CiFarmModule } from "./cifarm"

@Module({
    imports: [
        CiFarmModule.forRoot(),
        // CiWalletModule.forRoot()
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}

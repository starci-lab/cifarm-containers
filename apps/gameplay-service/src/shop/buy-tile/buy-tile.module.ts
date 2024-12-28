import { Global, Module } from "@nestjs/common"
import { WalletModule } from "@src/services/gameplay/wallet"
import { BuyTileController } from "./buy-tile.controller"
import { BuyTileService } from "./buy-tile.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        WalletModule
    ],
    controllers: [BuyTileController],
    providers: [BuyTileService],
    exports: [BuyTileService]
})
export class BuyTileModule {}

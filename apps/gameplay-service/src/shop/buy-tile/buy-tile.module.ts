import { Global, Module } from "@nestjs/common"
import { GoldBalanceModule, TokenBalanceModule } from "@src/services"
import { BuyTileController } from "./buy-tile.controller"
import { BuyTileService } from "./buy-tile.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GoldBalanceModule,
        TokenBalanceModule
    ],
    controllers: [BuyTileController],
    providers: [BuyTileService],
    exports: [BuyTileService]
})
export class BuyTileModule {}

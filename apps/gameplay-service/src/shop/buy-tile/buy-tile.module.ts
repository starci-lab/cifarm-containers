import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database/gameplay-postgresql"
import { WalletModule } from "@src/services/gameplay/wallet"
import { BuyTileController } from "./buy-tile.controller"
import { BuyTileService } from "./buy-tile.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as Array<EntityClassOrSchema>),
        WalletModule
    ],
    controllers: [BuyTileController],
    providers: [BuyTileService],
    exports: [BuyTileService]
})
export class BuyTileModule {}

import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database/gameplay-postgresql"
import { InventoryModule } from "@src/services/gameplay/inventory"
import { GoldBalanceModule } from "@src/services/gameplay/wallet"
import { BuySuppliesController } from "./buy-supplies.controller"
import { BuySuppliesService } from "./buy-supplies.service"


@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as EntityClassOrSchema[]),
        InventoryModule,
        GoldBalanceModule
    ],
    providers: [BuySuppliesService],
    exports: [BuySuppliesService],
    controllers: [BuySuppliesController]
})
export class BuySuppliesModule {}

import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database/gameplay-postgresql"
import { GoldBalanceModule, InventoryModule } from "@src/services"
import { BuySeedsController } from "./buy-seeds.controller"
import { BuySeedsService } from "./buy-seeds.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as Array<EntityClassOrSchema>),
        InventoryModule,
        GoldBalanceModule
    ],
    providers: [BuySeedsService],
    exports: [BuySeedsService],
    controllers: [BuySeedsController]
})
export class BuySeedsModule {}

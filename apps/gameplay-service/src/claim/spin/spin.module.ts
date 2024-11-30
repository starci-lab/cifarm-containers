import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database/gameplay-postgresql"
import { InventoryModule, WalletModule } from "@src/services"
import { SpinController } from "./spin.controller"
import { SpinService } from "./spin.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as EntityClassOrSchema[]),
        WalletModule,
        InventoryModule
    ],
    providers: [SpinService],
    exports: [SpinService],
    controllers: [SpinController]
})
export class SpinModule {}

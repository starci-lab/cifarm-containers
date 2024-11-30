import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { UsePesticideController } from "./use-pesticide.controller"
import { UsePesticideService } from "./use-pesticide.service"
import * as Entities from "@src/database/gameplay-postgresql"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as EntityClassOrSchema[]),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [UsePesticideController],
    providers: [UsePesticideService],
    exports: [UsePesticideService]
})
export class UsePesticideModule {}

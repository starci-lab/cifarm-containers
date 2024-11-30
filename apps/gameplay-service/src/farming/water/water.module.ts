import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database/gameplay-postgresql"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { WaterService } from "./water.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as Array<EntityClassOrSchema>),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    providers: [WaterService],
    exports: [WaterService]
})
export class WaterModule {}

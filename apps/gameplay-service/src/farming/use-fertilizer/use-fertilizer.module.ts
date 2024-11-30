import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { UseFertilizerController } from "./use-fertilizer.controller"
import { UseFertilizerService } from "./use-fertilizer.service"
import * as Entities from "@src/database/gameplay-postgresql"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as Array<EntityClassOrSchema>),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [UseFertilizerController],
    providers: [UseFertilizerService],
    exports: [UseFertilizerService]
})
export class UseFertilizerModule {}

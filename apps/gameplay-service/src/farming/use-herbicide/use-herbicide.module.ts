import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { UseHerbicideService } from "./use-herbicide.service"
import { UseHerbicideController } from "./use-herbicide.controller"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database/gameplay-postgresql"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as EntityClassOrSchema[]),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [UseHerbicideController],
    providers: [UseHerbicideService],
    exports: [UseHerbicideService]
})
export class UseHerbicideModule {}

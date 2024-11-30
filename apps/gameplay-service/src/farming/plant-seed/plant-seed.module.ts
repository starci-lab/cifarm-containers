import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { PlantSeedController } from "./plant-seed.controller"
import { PlantSeedService } from "./plant-seed.service"
import * as Entities from "@src/database/gameplay-postgresql"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as EntityClassOrSchema[]),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [PlantSeedController],
    providers: [PlantSeedService],
    exports: [PlantSeedService]
})
export class PlantSeedModule {}

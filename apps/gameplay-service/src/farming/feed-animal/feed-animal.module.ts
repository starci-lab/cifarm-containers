import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { FeedAnimalController } from "./feed-animal.controller"
import * as Entities from "@src/database/gameplay-postgresql"
import { FeedAnimalService } from "./feed-animal.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)] as Array<EntityClassOrSchema>),
        EnergyModule,
        LevelModule,
        InventoryModule,
    ],
    controllers: [FeedAnimalController],
    providers: [FeedAnimalService],
    exports: [FeedAnimalService],
})
export class FeedAnimalModule {}

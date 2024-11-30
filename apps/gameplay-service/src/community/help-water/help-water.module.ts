import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HelpWaterController } from "./help-water.controller"
import { HelpWaterService } from "./help-water.service"
import { EnergyModule, LevelModule } from "@src/services"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature(Object.values(Entities) as Array<EntityClassOrSchema>),
        EnergyModule,
        LevelModule
    ],
    providers: [HelpWaterService],
    exports: [HelpWaterService],
    controllers: [HelpWaterController]
})
export class HelpWaterModule {}

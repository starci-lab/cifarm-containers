import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { PlaceTileController } from "./place-tile.controller"
import { PlaceTileService } from "./place-tile.service"
import * as Entities from "@src/database/gameplay-postgresql"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)] as Array<EntityClassOrSchema>)
    ],
    controllers: [PlaceTileController],
    providers: [PlaceTileService],
    exports: [PlaceTileService]
})
export class PlaceTileModule {}

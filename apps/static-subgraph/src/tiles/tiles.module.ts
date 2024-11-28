import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryTypeEntity, TileEntity } from "@src/database"
import { TilesResolver } from "./tiles.resolver"
import { TilesService } from "./tiles.service"

@Module({
    imports: [TypeOrmModule.forFeature([TileEntity,InventoryTypeEntity])],
    providers: [TilesService, TilesResolver]
})
export class TilesModule {}

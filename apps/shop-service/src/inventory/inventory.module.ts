import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryEntity, UserEntity } from "@src/database"
import { InventoryService } from "./inventory.service"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, InventoryEntity])],
    providers: [InventoryService],
    exports: [InventoryService]
})
export class InventoryModule {}

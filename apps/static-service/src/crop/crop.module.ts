import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AnimalEntity, CropEntity, ProductEntity } from "@src/database"
import { CropService } from "./crop.service"
import { CropController } from "./crop.controller"

@Module({
    imports: [TypeOrmModule.forFeature([CropEntity, ProductEntity, AnimalEntity])],
    controllers: [CropController],
    providers: [CropService],
    exports: [CropService]
})
export class CropModule {}

import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AnimalEntity, CropEntity, ProductEntity } from "@src/database"
import { CropsResolver } from "./crops.resolver"
import { CropsService } from "./crops.service"

@Module({
    imports: [TypeOrmModule.forFeature([AnimalEntity, ProductEntity, CropEntity])],
    providers: [CropsService, CropsResolver]
})
export class CropsModule {}

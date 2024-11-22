import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CropEntity, AnimalEntity, ProductEntity } from "@src/database"
import { AnimalService } from "./animal.service"
import { AnimalController } from "./animal.controller"

@Module({
    imports: [TypeOrmModule.forFeature([CropEntity, ProductEntity, AnimalEntity])],
    controllers: [AnimalController],
    providers: [AnimalService],
    exports: [AnimalService]
})
export class AnimalModule {}

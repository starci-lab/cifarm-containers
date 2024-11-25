import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AnimalEntity, CropEntity, ProductEntity } from "@src/database"
import { AnimalsResolver } from "./animals.resolver"
import { AnimalsService } from "./animals.service"

@Module({
    imports: [TypeOrmModule.forFeature([AnimalEntity, CropEntity, ProductEntity])],
    providers: [AnimalsService, AnimalsResolver]
})
export class AnimalsModule {}
